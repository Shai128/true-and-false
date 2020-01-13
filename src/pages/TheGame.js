import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
//import {JoinGame} from './JoinGame.js'


import { useStyles as AppUseStyles } from './../App.js';
//import {Link} from "react-router-dom";
import {
  useHistory,
} from "react-router-dom";


import { socket, emptyUser } from './../user.js';

import { DisplayLoading, DisplayDBError } from './../PagesUtils.js'
import { isUndefined } from './../Utils.js'
import { getSentencesFromDB } from './../game.js'
const NO_MORE_SENTENCES = "no more sentences"
const TRUE_SENTENCE = "true sentence"
const FALSE_SENTENCE = "false sentence"
const INITIAL_STATE = "initial game state"
const MY_TURN_STATE = "my turn and I need to choose a sentence"
const MY_TURN_SENTENCE_CHOSEN_STATE = "I chose a sentence and now I choose if to continue or end the game"
const OPPONENT_TURN_STATE = "opponent's turn and he needs to choose a sentence"
const OPPONENT_TURN_SENTENCE_CHOSEN_STATE = "opponent chose a sentence and now he needs to choose if to continue or end the game"
const OPPONENT_TURN_MESSAGE = "Opponent's turn. The sentence is: "
const BONUS_POINTS_FOR_CORRECT_ANSWER = 3;
const BONUS_POINTS_FOR_WRONG_ANSWER = 1;
const NO_MORE_SENTENCES_MESSAGE_TO_USER = "There are no more sentences to display!!"
const userStates = {
  INVALID: 0,
  AVAILABLE: 1,
  UNAVAILABLE: 2
}


export function TheGame(props) {
  let history = useHistory();
  const classes = AppUseStyles();
  console.log("props: ", props)
  const [DBError, setDBError] = React.useState(false);
  if (isUndefined(props) || isUndefined(props.location)) {
    setDBError(true);
    props = {
      location: {
        user: emptyUser(),
        room: {},
        opponentId: '',
        turn: true
      }
    }
  }
  const user = props.location.user;
  const room = props.location.room;
  const [opponentId, setOpponentId] = React.useState(props.location.opponentId); /////////////////////// todo: change to const
  const [answered, setAnswered] = React.useState(false);
  const [noMoreSentences, setNoMoreSentences] = React.useState(false);
  let myturn = props.location.turn;
  const [questionsCount, setQuestionsCount] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [sentence, setSentence] = React.useState("");
  const [opGuess, setOpGuess] = React.useState("");
  const [opIsCorrect, setOpIsCorrect] = React.useState("");
  const [truths, setTruths] = React.useState([]);
  const [lies, setLies] = React.useState([]);
  const [isFinishedLoading, setIsFinishedLoading] = React.useState(false);
  let initial_seen = isUndefined(user.already_seen_sentences) ? [] : user.already_seen_sentences
  const [seenSentences, setSeenSentences] = React.useState(initial_seen);
  const [startedReadingFromDB, setStartedReadingFromDB] = React.useState(false);
  const [matchPoints, setMatchPoints] = React.useState(0);
  const [displayEndGameButton, setDisplayEndGameButton] = React.useState(true);

  // const [isFirstTurn, setIsFirstTurn] =  React.useState(true);
  const [gameState, setGameState] = React.useState(INITIAL_STATE);
  const [sentenceType, setSentenceType] = React.useState(''); // can be TRUE_SENTENCE or FALSE_SENTENCE
  const [myGuess, setMyGuess] = React.useState(''); // can be TRUE_SENTENCE or FALSE_SENTENCE.
  const [disableButtons, setDisableButtons] = React.useState(false); // can be TRUE_SENTENCE or FALSE_SENTENCE.


  useEffect(
    () => {
      if (gameState !== MY_TURN_STATE || noMoreSentences)
        setDisableButtons(true);
      else
        setDisableButtons(false);
      if (gameState === MY_TURN_STATE || gameState === OPPONENT_TURN_STATE)
        setAnswered(false);

      if (gameState !== MY_TURN_SENTENCE_CHOSEN_STATE)
        setDisplayEndGameButton(true)
      else
        setDisplayEndGameButton(false);
      if (noMoreSentences)
        setSentence(NO_MORE_SENTENCES_MESSAGE_TO_USER);
    },
    [gameState, noMoreSentences]
  )
  if (DBError) {
    return <DisplayDBError history={history} />
  }

  socket.off('continueMatch');
  socket.on('continueMatch', function (args) {
    console.log('received continueMatch message.')
    setGameState(MY_TURN_STATE);
    console.log('truths: ', truths);
    console.log('lies: ', lies);
    console.log('seenSentences: ', seenSentences);
    getSentenceAndDisplayIt(truths, lies, seenSentences);
  });

  socket.off('endMatch');
  socket.on('endMatch', function () {
    updateAfterMatchData(user, room, matchPoints, history, seenSentences)
  });

  socket.off('displaySentence');
  socket.on('displaySentence', function (args) {
    console.log('received displaySentence')
    console.log('args: ', args)
    if (args.info === NO_MORE_SENTENCES)
      setNoMoreSentences(true);
    else
      setSentence(OPPONENT_TURN_MESSAGE + args.sentence);
  });

  socket.off('displayAnswer');
  socket.on('displayAnswer', function (args) {
    console.log('received message displayAnswer. args:', args);
    setOpGuess(args.guess === TRUE_SENTENCE ? 'TRUE' : 'FALSE');
    setOpIsCorrect(args.isCorrect ? 'right' : 'wrong');
    setAnswered(true);
  });

  // sentence is the string sentence that I see now (if it is my turn). I deliver it to my opponent
  // he will be able to see the sentence I currently have.
  // info can be NO_MORE_SENTENCES, TRUE_SENTENCE or FALSE_SENTENCE
  const deliverCurrentSentenceToOpponent = (sentence, info) => {
    socket.emit('deliverMessage', {
      message: "displaySentence",
      receiverId: opponentId,
      args: { sentence: sentence, info: info }
    });
  }

  // should be called only once per turn!
  const getSentenceAndDisplayIt = (truths, lies, seenSentences) => {
    let sentence_meta_data = getSentence(truths, lies, seenSentences, setTruths, setLies, setSeenSentences)
    deliverCurrentSentenceToOpponent(sentence_meta_data.sentence, sentence_meta_data.info)
    if (sentence_meta_data.info === NO_MORE_SENTENCES) {
      setNoMoreSentences(true)
      setSentence(NO_MORE_SENTENCES_MESSAGE_TO_USER)
    }
    else {
      setSentence(sentence_meta_data.sentence)
      setSentenceType(sentence_meta_data.info)
    }
  }

  // this function will be called once: after reading the data from the DB
  const setInitialGameState = (truths, lies, seenSentences) => {
    if (gameState === INITIAL_STATE) {
      if (myturn) { // in case the first turn is the mine
        getSentenceAndDisplayIt(truths, lies, seenSentences);
        setGameState(MY_TURN_STATE)
      }
      else { // in case the first turn is the opponent's

        setGameState(OPPONENT_TURN_STATE)
      }
    }

  }

  if (!isFinishedLoading) {
    if (!startedReadingFromDB) {
      setStartedReadingFromDB(true);
      getSentencesFromDB(opponentId, room,
        (data) => {
          console.log('getSentencesFromDB');
          console.log('got data from DB: ', data);
          if (isUndefined(data)) {
            setDBError(true);
            return;
          }
          let trues = data.truths
          let falses = data.lies

          const validSentence = (x) => {
            let lies = isUndefined(user.false_sentences) ? [] : user.false_sentences.map(x => x.value);
            let truths = isUndefined(user.true_sentences) ? [] : user.true_sentences.map(x => x.value);

            return !seenSentences.includes(x) && !truths.includes(x) && !lies.includes(x);
          }

          trues = trues.filter(validSentence);
          falses = falses.filter(validSentence);
          setTruths(trues);
          setLies(falses);
          setInitialGameState(trues, falses, seenSentences)
          setIsFinishedLoading(true)
        }, () => { })
    }
    return (<DisplayLoading />);
  }

  // selection can be TRUE_SENTENCE or FALSE_SENTENCE
  const handleClickTrueOrFalse = (selection) => {
    console.log("inside handleClickTrueOrFalse. props: ", props)
    setGameState(MY_TURN_SENTENCE_CHOSEN_STATE);
    setMyGuess(selection);
    setQuestionsCount(questionsCount + 1)
    let scoreBonus;
    let newCorrectCount = correctCount;
    if (selection === sentenceType) {
      newCorrectCount++;
      scoreBonus = BONUS_POINTS_FOR_CORRECT_ANSWER;
    }
    else
      scoreBonus = BONUS_POINTS_FOR_WRONG_ANSWER;
    setCorrectCount(newCorrectCount)
    setMatchPoints(matchPoints + scoreBonus)
    socket.emit('deliverMessage', {
      message: "displayAnswer",
      receiverId: opponentId,
      args: {
        guess: selection,
        isCorrect: selection === sentenceType
      }
    });
  }



  return (
    <div id="theGamePage">
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper} >
          <Grid container >
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" align="left" color="primary">
                {/* Your total points: {totalPoints}<br/> */}
                Points in this round: {matchPoints}<br />
                Correct answers in this round: {correctCount}/{questionsCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography id="opponentName" variant="h6" align="right" color="primary">
                Playing against {props.location.opponentName}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="stretch" justify="center">
            <Grid item xs={12} sm={12}>
              <Typography id="displaidSentence" variant="h3" align="center">
                {sentence}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button id="TrueBTN"
                variant="contained"
                color="primary"
                className={classes.button}
                disabled={disableButtons}
                onClick={() => { handleClickTrueOrFalse(TRUE_SENTENCE); }}
                fullWidth>
                True
            </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button id="FalseBTN"
                variant="contained"
                color="secondary"
                className={classes.button}
                disabled={disableButtons}
                onClick={() => { handleClickTrueOrFalse(FALSE_SENTENCE); }}
                fullWidth>
                False
            </Button>
            </Grid>


            <Result myGuess={myGuess} sentenceType={sentenceType}
              gameState={gameState} setGameState={setGameState}
              opponentId={opponentId} user={user}
              seenSentences={seenSentences} matchPoints={matchPoints}
              room={room} />


            <Grid item xs={12} style={{
              height: 240, display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }} >
              {answered && <Typography variant="h5">
                The opponent answered {opGuess}. He was {opIsCorrect}! <br />
                Waiting to the opponent to choose whether to continue or not.
            </Typography>
              }
            </Grid>

          </Grid>

          <Grid container style={{ height: 100 }}>
            {displayEndGameButton && <Grid item xs={12}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >

              {/* <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}> */}
              <Button id="EndGameBTN1"

                variant="contained" color="secondary"
                onClick={() => {
                  socket.emit('deliverMessage', {
                    receiverId: opponentId,
                    message: "endMatch",
                    args: {}
                  });
                  updateAfterMatchData(user, room, matchPoints, history, seenSentences)
                }}
              >
                end game
              </Button>
              {/* </Link> */}
            </Grid>
            }
          </Grid>

        </div>
      </Container>
    </div>
  );
}

// display my selection result
function Result(props) {

  const RIGHT_RESULT = "You are right!!";
  const WRONG_RESULT = "You are wrong :(";
  const UNINITIALIZED_RESULT = "";
  const { myGuess, sentenceType, gameState, setGameState, opponentId, user, seenSentences, matchPoints, room } = props;
  const [result, setResult] = React.useState(UNINITIALIZED_RESULT);
  let history = useHistory();
  if (gameState === INITIAL_STATE || gameState === MY_TURN_STATE ||
    gameState === OPPONENT_TURN_STATE || gameState === OPPONENT_TURN_SENTENCE_CHOSEN_STATE) {
    return (<div />);
  }
  if (gameState === MY_TURN_SENTENCE_CHOSEN_STATE && result === UNINITIALIZED_RESULT)
    setResult(myGuess === sentenceType ? RIGHT_RESULT : WRONG_RESULT);
  return (
    <Container component="main" maxWidth="sm">
      <div>
        <Grid container spacing={2} justify="center">
          <Typography variant="h2" justify="center">
            <br />
            {result}
          </Typography>

          <Grid item xs={12} sm={6}>
            <Button id="NextSentenceBTN"
              variant="contained" color="primary" fullWidth
              onClick={() => {
                setResult(UNINITIALIZED_RESULT);
                setGameState(OPPONENT_TURN_STATE);
                console.log('emmiting continueMatch message')
                socket.emit('deliverMessage', {
                  receiverId: opponentId,
                  message: "continueMatch",
                  args: {}
                });
              }}>
              next sentence
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>

            <Button id="EndGameBTN"
              variant="contained" color="secondary" fullWidth
              onClick={() => { /////////////////// todo: check implementation in backend
                socket.emit('deliverMessage', {
                  receiverId: opponentId,
                  message: "endMatch",
                  args: {}
                });
                updateAfterMatchData(user, room, matchPoints, history, seenSentences)
              }}
            >
              end game
              </Button>
          </Grid>

        </Grid>
      </div>
    </Container>
  );
}

function getSentence(truths, lies, seenSentences, setTruths, setLies, setSeenSentences) {
  let ans, sentence, info;
  console.log('inside getSentence')
  console.log(truths)
  console.log(lies)
  console.log(seenSentences)
  if ((Math.floor(Math.random() * 2) || lies.length === 0) && truths.length > 0) {
    console.log('choosing a true sentence');
    ans = true;
    //let filtered_trues = trues.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random() * truths.length)
    setSeenSentences(seenSentences.concat([truths[i]]));
    sentence = truths[i];

    let new_truths = JSON.parse(JSON.stringify(truths));
    new_truths.splice(i, 1);
    setTruths(new_truths);
    info = TRUE_SENTENCE;
  }
  else if (lies.length > 0) {
    console.log('choosing a false sentence');

    ans = false;
    //let filtered_falses = falses.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random() * lies.length)
    setSeenSentences(seenSentences.concat([lies[i]]));

    sentence = lies[i];

    let new_lies = JSON.parse(JSON.stringify(lies));
    new_lies.splice(i, 1);
    setLies(new_lies);
    info = FALSE_SENTENCE
  }
  else {
    console.log('tried to choose a sentence but there are no more sentences');

    sentence = "No more sentences...";
    ans = "";
    info = NO_MORE_SENTENCES
  }
  return { sentence: sentence, ans: ans, info: info };
}

function updateAfterMatchData(user, room, matchPoints, history, seenSentences) {
  let newUser = JSON.parse(JSON.stringify(user));
  newUser.already_seen_sentences = seenSentences
  if (isNaN(newUser.score)){
    newUser.score = 0
  }
  newUser.score += matchPoints
  console.log("update after user points: ", newUser)
  socket.emit('updateUserInRoom', { roomId: room.room_id, user: newUser }) // todo: complete data

  // socket.emit('changeUserAvailability', {
  //   newAvailability: userStates.AVAILABLE, userId: user.email, roomId: room.room_id
  // })

  history.push({
    pathname: '/LoginScreen/JoinGame',
    InfoObject: { userObject: newUser, roomObject: room }
  });
}
