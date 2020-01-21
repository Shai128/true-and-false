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

import { socket, updateUserToDB, getUserFromLocalStorage, } from './../user.js';
import { updateGameInLocalStorage, getGameFromLocalStorage, } from './../user_game';

import { DisplayLoading, DisplayDBError } from './../PagesUtils.js'
import { isUndefined, colors, okStatus, serverIP } from './../Utils.js'
import { getSentencesFromDB } from './../game.js'
import { userStates } from './JoinGame.js'
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
const server = "http://" + serverIP + ':8000'

export function TheGame(props) {
  let history = useHistory();
  const classes = AppUseStyles();
  console.log("props: ", props)
  const [DBError, setDBError] = React.useState(false);
  const [isPropsInitialized, setIsPropsInitialized] = React.useState(false);


  if (isUndefined(props) || isUndefined(props.location)) {
    let localStorageGame = getGameFromLocalStorage()
    console.log('the data from local storage is: ', localStorageGame);
    props = {
      location: {
        ...localStorageGame,
        user: getUserFromLocalStorage()
      }
    }
  }
  else if (!isPropsInitialized) {
    setIsPropsInitialized(true);
    console.log('initializing props');
    let gameToStore = {
      opponentName: props.location.opponentName,
      room: props.location.room,
      opponentId: props.location.opponentId,
      turn: props.location.turn,
      score: props.location.user,
      questionsCount: 0,
      correctCount: 0,
      gameState: INITIAL_STATE,
      sentence: '',
      noMoreSentences: false,
      sentenceType: '',
      disableButtons: false,
      myGuess: '',
      answered: false,
      matchPoints: 0,
      seenSentences: isUndefined(props.location.user.already_seen_sentences) ? [] : props.location.user.already_seen_sentences,
      lies: [],
      truths: [],
      opIsCorrect: "",
      opGuess: '',
    }
    props = {
      location: {
        ...gameToStore,
        user: props.location.user//getUserFromLocalStorage()
      }
    }
    updateGameInLocalStorage(gameToStore)


  }

  const [user, setUser] = React.useState(props.location.user);
  const room = props.location.room;
  const opponentId = props.location.opponentId;
  const [answered, setAnswered] = React.useState(props.location.answered);
  const [noMoreSentences, setNoMoreSentences] = React.useState(props.location.noMoreSentences);
  let myturn = props.location.turn;
  const [questionsCount, setQuestionsCount] = React.useState(props.location.questionsCount);
  const [correctCount, setCorrectCount] = React.useState(props.location.correctCount);
  const [sentence, setSentence] = React.useState(props.location.sentence);
  const [opGuess, setOpGuess] = React.useState(props.location.opGuess);
  const [opIsCorrect, setOpIsCorrect] = React.useState(props.location.opIsCorrect);
  const [truths, setTruths] = React.useState(props.location.truths);
  const [lies, setLies] = React.useState(props.location.lies);
  const [isFinishedLoading, setIsFinishedLoading] = React.useState(false);
  const [seenSentences, setSeenSentences] = React.useState(props.location.seenSentences);
  const [startedReadingFromDB, setStartedReadingFromDB] = React.useState(false);
  const [matchPoints, setMatchPoints] = React.useState(props.location.matchPoints);
  console.log("matchpoints: ", matchPoints);
  const [displayEndGameButton, setDisplayEndGameButton] = React.useState(props.location.displayEndGameButton);

  const [gameState, setGameState] = React.useState(props.location.gameState);
  const [sentenceType, setSentenceType] = React.useState(props.location.sentenceType); // can be TRUE_SENTENCE or FALSE_SENTENCE
  const [myGuess, setMyGuess] = React.useState(props.location.myGuess); // can be TRUE_SENTENCE or FALSE_SENTENCE.
  const [disableButtons, setDisableButtons] = React.useState(props.location.disableButtons);


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
    [gameState, noMoreSentences, matchPoints, props.location.room, props.location.opponentId, props.location.user,]
  )

  useEffect(
    () => {
      let gameToStore = {
        opponentName: props.location.opponentName,
        room: props.location.room,
        opponentId: props.location.opponentId,
        turn: gameState === MY_TURN_STATE ? true : false,
        score: props.location.score,
        matchPoints: matchPoints,
        questionsCount: questionsCount,
        correctCount: correctCount,
        gameState: gameState,
        noMoreSentences: noMoreSentences,
        sentence: sentence,
        disableButtons: disableButtons,
        myGuess: myGuess,
        sentenceType: sentenceType,
        displayEndGameButton: displayEndGameButton,
        seenSentences: seenSentences,
        lies: lies,
        truths: truths,
        opIsCorrect: opIsCorrect,
        opGuess: opGuess,
        answered: answered,

      }
      updateGameInLocalStorage(gameToStore)
    },
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
    updateAfterMatchData(user, room, matchPoints, history, seenSentences, opponentId)
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
    setGameState(OPPONENT_TURN_SENTENCE_CHOSEN_STATE);
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
          //var new_user = { ...user };
          //new_user.score = data.userObject.score
          //setUser(new_user);
          //var new_seenSentences = seenSentences.concat(data.userObject.already_seen_sentences)
          //setSeenSentences(new_seenSentences);
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

          console.log("update sentences form DB truths: ", truths, "lies: ", lies)
          trues = trues.filter(validSentence);
          falses = falses.filter(validSentence);
          trues = trues.filter((sent) => !seenSentences.includes(sent))
          falses = falses.filter((sent) => !seenSentences.includes(sent))
          setTruths(trues);
          setLies(falses);
          setInitialGameState(trues, falses, seenSentences)
          setIsFinishedLoading(true)
          console.log("truths: ", truths, "lies: ", lies)
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

  let color = colors[Math.floor(Math.random() * colors.length)]
  let index = Math.floor(Math.random() * 3)
  let res1 = color[(index) % 3]
  let res2 = color[(index + 2) % 3]
  if (disableButtons) { res1 = "grey"; res2 = "grey"; }


  return (
    <div id="theGamePage"
      style={{
        background: 'linear-gradient(80deg, ' + color[index % 3] + ' 30%, rgba(0,0,0,0) 30%),'
          + 'linear-gradient(45deg, ' + color[(index + 1) % 3] + ' 65%, ' + color[(index + 2) % 3] + ' 65%'
      }}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper}>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" align="left" style={{ color: "white", textShadow: "1px 1px 3px black" }}>
                {/* Your total points: {totalPoints}<br/> */}
                Points in this round: {matchPoints}<br />
                Correct answers in this round: {correctCount}/{questionsCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography id="opponentName" variant="h6" align="right" style={{ color: "white", textShadow: "1px 1px 3px black" }}>
                Playing against {props.location.opponentName}
              </Typography>
            </Grid>

            {displayEndGameButton && <Grid item xs={12}
              style={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center"
              }}
            >

              {/* <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}> */}
              <Button id="EndGameBTN1"
                style={{ background: color[(index + 2) % 3] }}
                variant="contained" color="secondary"
                onClick={() => {
                  socket.emit('deliverMessage', {
                    receiverId: opponentId,
                    message: "endMatch",
                    args: {}
                  });
                  updateAfterMatchData(user, room, matchPoints, history, seenSentences, opponentId)
                }}
              >
                <Typography justify="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                  end game
              </Typography>
              </Button>
              {/* </Link> */}
            </Grid>
            }

          </Grid>
          <Grid container spacing={1} alignItems="stretch" justify="center">
            <Grid item xs={12} sm={12}>
              <Typography variant="h4" align="center" style={{ color: "white", textShadow: "1px 1px 3px black" }}>
                {sentence}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button id="TrueBTN"
                variant="contained"
                color="primary"
                disabled={disableButtons}
                onClick={() => { handleClickTrueOrFalse(TRUE_SENTENCE); }}
                fullWidth
                style={{ height: 150, marginTop: 10, backgroundColor: res1, boxShadow: "2px 2px 5px black" }}>
                <Typography variant="h3" align="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                  True
                  </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button id="FalseBTN"
                variant="contained"
                color="primary"
                className={classes.button}
                disabled={disableButtons}
                onClick={() => { handleClickTrueOrFalse(FALSE_SENTENCE); }}
                fullWidth
                style={{ height: 150, marginTop: 10, backgroundColor: res2, boxShadow: "2px 2px 5px black" }}>
                <Typography variant="h3" align="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                  False
                  </Typography>
              </Button>
            </Grid>


            <Result myGuess={myGuess} sentenceType={sentenceType}
              gameState={gameState} setGameState={setGameState}
              opponentId={opponentId} user={user}
              seenSentences={seenSentences} matchPoints={matchPoints}
              room={room} color={color} index={index} />


            <Grid item xs={12} style={{
              height: 240, display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }} >
              {answered && <Typography variant="h5" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                The opponent answered {opGuess}. He was {opIsCorrect}! <br />
                Waiting to the opponent to choose whether to continue or not.
            </Typography>
              }
            </Grid>

          </Grid>

        </div>
      </Container>
    </div>
  );
}

// display my selection result
function Result(props) {
  const color = props.color
  const index = props.index
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
          <Typography variant="h2" justify="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
            <br />
            {result}
          </Typography>

          <Grid item xs={12} sm={6}>
            <Button id="NextSentenceBTN"
              style={{ backgroundColor: color[(index) % 3] }}
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
              <Typography justify="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                next sentence
              </Typography>

            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>

            <Button id="EndGameBTN"
              variant="contained" color="secondary" fullWidth
              style={{ backgroundColor: color[(index + 2) % 3] }}
              onClick={() => { /////////////////// todo: check implementation in backend
                socket.emit('deliverMessage', {
                  receiverId: opponentId,
                  message: "endMatch",
                  args: {}
                });
                updateAfterMatchData(user, room, matchPoints, history, seenSentences, opponentId)
              }}
            >
              <Typography justify="center" style={{ color: 'white', textShadow: "1px 1px 3px black" }}>
                end game
              </Typography>
            </Button>
          </Grid>

        </Grid>
      </div>
    </Container>
  );
}

function getSentence(truths, lies, seenSentences, setTruths, setLies, setSeenSentences) {
  let ans, sentence, info;
  let trues = truths
  let falses = lies
  trues = trues.filter((sent) => !seenSentences.includes(sent))
  falses = falses.filter((sent) => !seenSentences.includes(sent))
  console.log('trues:', trues)
  console.log('falses:', falses)
  setTruths(trues);
  setLies(falses);
  console.log('inside getSentence')
  console.log('truthes:', truths)
  console.log('falses:', lies)
  console.log(seenSentences)
  if ((Math.floor(Math.random() * 2) || lies.length === 0) && truths.length > 0) {
    console.log('choosing a true sentence');
    ans = true;
    //let filtered_trues = trues.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random() * truths.length)
    setSeenSentences(seenSentences.concat([truths[i]]))
    sentence = truths[i];

    let new_truths = JSON.parse(JSON.stringify(truths))
    new_truths.splice(i, 1)
    setTruths(new_truths)
    info = TRUE_SENTENCE
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

function updateAfterMatchData(user, room, matchPoints, history, seenSentences, opponentId) {
  let newUser = JSON.parse(JSON.stringify(user));
  newUser.already_seen_sentences = seenSentences
  if (isNaN(newUser.score)) {
    newUser.score = 0
  }
  newUser.score += matchPoints
  console.log("update after user points: ", newUser)
  updateUserToDB(newUser);
  socket.emit('updateUserInRoom', { roomId: room.room_id, user: newUser }) // todo: complete data

  var users = [user.email, opponentId];

  socket.emit('changeAvailabilityAll', {
    newAvailability: userStates.AVAILABLE, users: users, roomId: room.room_id
  })


  // socket.emit('changeUserAvailability', {
  //   newAvailability: userStates.AVAILABLE, userId: user.email, roomId: room.room_id
  // })

  history.push({
    pathname: '/LoginScreen/JoinGame',
    InfoObject: { userObject: newUser, roomObject: room, returnFromGame: true, }
  });
}
