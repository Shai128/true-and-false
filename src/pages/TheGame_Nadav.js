import React, {useEffect} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
//import {JoinGame} from './JoinGame.js'


import {useStyles as AppUseStyles} from './../App.js';
//import {Link} from "react-router-dom";
import {
  useHistory,
} from "react-router-dom";


import {socket} from './../user.js';

import {DisplayLoading} from './../PagesUtils.js'
import {isUndefined} from './../Utils.js'
import {getSentencesFromDB} from './../game.js'

// Very important comment by: Shai. global variables are bad habit. you should avoid doing that
var matchPoints
var totalPoints
var ans, flag = true;
var guess_str, isCorrect, result;

export function TheGame(props){
    let history = useHistory();
    const classes = AppUseStyles();
    console.log("props: ", props)
    const user = props.location.user
    const room = props.location.room
    const opponentId = props.location.opponentId; /////////////////////// todo: change to const
    const [choosed, setChoosed] = React.useState(false);
    const [answered, setAnswered] = React.useState(false);
    const [noMoreSentences, setNoMoreSentences] = React.useState(false);
    const [myturn, setMyturn] = React.useState(true);
    const [questionsCount, setQuestionsCount] = React.useState(-1);
    const [correctCount, setCorrectCount] = React.useState(0);
    const [guess, setGuess] = React.useState(true);
    const [sentence, setSentence] = React.useState("");
    const [opGuess, setOpGuess] = React.useState("");
    const [opIsCorrect, setOpIsCorrect] = React.useState("");
    const [sentenceCheck, setSentenceCheck] = React.useState("");
    const [truths, setTruths] = React.useState([]);
    const [lies, setLies] = React.useState([]);
    const [isFinishedLoading, setIsFinishedLoading] = React.useState(false);
    let initial_seen = isUndefined(user.already_seen_sentences)? [] : user.already_seen_sentences
    const [seenSentences, setSeenSentences] = React.useState(initial_seen);
    const [startedReadingFromDB, setStartedReadingFromDB] =  React.useState(false);

    

    


    var tmpMyturn = true
    
    if(questionsCount === -1){
      setSentenceCheck("")
      matchPoints = 0
      totalPoints = user.score
      setCorrectCount(0)
      setQuestionsCount(0);
      setMyturn(props.location.turn);
      tmpMyturn = props.location.turn
      //seen = user.already_seen_sentences;
    }

    matchPoints = correctCount*3 + (questionsCount - correctCount)*1
    totalPoints = user.score + matchPoints

  
    if(!isFinishedLoading)
      return;
    console.log('myturn: ', myturn, " tmpMyturn: ", tmpMyturn + " sentenceCheck: ", sentenceCheck)
    if(myturn && sentenceCheck === ""){
      console.log("got here!")
      setChoosed(false);
      //console.log('sentence before chosing a new one: ' + sentence)
      let tmp = getSentence(truths, lies, seenSentences, setTruths, setLies, setSeenSentences);
      setSentenceCheck(tmp.sentence);
      setSentence(tmp.sentence);
      //console.log('sentence after chosing a new one: ' + tmp.sentence + ", " + sentence)
      ans = tmp.ans;
      console.log('delivering message: displaySentence with sentence: ', tmp.sentence);

      // Very important comment by: Shai. You should emit through button onclick.
      // This emit might occur more than once, which is not what you wanted to happen.
      socket.emit('deliverMessage',{
        message: "displaySentence",
        receiverId: opponentId,
        args: {sentence: tmp.sentence}
        });
      console.log("sending the sentence to opponent")
      if(sentenceCheck == "No more sentences..."){
        console.log("no more sentences")
        setChoosed(true);
        setNoMoreSentences(true);
      }
      console.log("choosed1: " + choosed)
      //setMyturn(false);
    }
  
    
    useEffect(
      () => {
        if(!isFinishedLoading)
          return;
        if (!myturn && !choosed){
          // really important comment by: Shai. That's not how to write a code. 
          // you should make "Loading..." a constant variable (name is loading for example with value "Loading...")
          // and assign the constant variable here. this mistake repeats over and over in the code and 
          // this is really sad :(
          setSentenceCheck("Loading..."); 
          setSentence("Loading...");
          setChoosed(true);
        }
      },
      [myturn, choosed, isFinishedLoading]
    )
    
    if(!isFinishedLoading){
      if(!startedReadingFromDB){
        setStartedReadingFromDB(true);
        getSentencesFromDB(opponentId, room, 
          (data)=>{
            console.log('getSentencesFromDB');
            console.log('got data from DB: ', data);
            let trues = data.truths
            let falses = data.lies

            const validSentence = (x) =>{
              let lies = isUndefined(user.false_sentences)? []: user.false_sentences.map(x=>x.value);
              let truths = isUndefined(user.true_sentences)? []: user.true_sentences.map(x=>x.value);

              return !seenSentences.includes(x) && !truths.includes(x) && !lies.includes(x);
            }

            trues = trues.filter(validSentence);
            falses = falses.filter(validSentence);
            setTruths(trues);
            setLies(falses);
            setIsFinishedLoading(true)
        }, ()=>{})
      }
      return (<DisplayLoading/>);
    }

    socket.on('displaySentence', function(args){
      socket.off('displaySentence');
      console.log('received displaySentence')
      console.log('args: ', args)
      setSentenceCheck("opponent's turn: ".concat(args.sentence));
      setSentence("opponent's turn: ".concat(args.sentence));
      setChoosed(true);
    });

    socket.on('displayAnswer', function(args){
      socket.off('displayAnswer');
      setOpGuess(args.guess);
      setOpIsCorrect(args.isCorrect);
      setAnswered(true);
    });

    socket.on('continueMatch', function(args){
      socket.off('continueMatch');

      //console.log("continueMatch1: " + myturn + sentenceCheck)
      if (sentenceCheck.startsWith("opponent's turn:")){ // if it is the first time here
        setSentenceCheck("")
        setSentence("");
      }
      setAnswered(false);
      setMyturn(true);
      //console.log("continueMatch2: " + myturn + sentence)
    });

    socket.on('endMatch', function(){
      socket.off('endMatch');
      updateAfterMatchData(user, room, matchPoints, history, seenSentences)
    });

    return (
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper} >
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" align="left" color="primary">
                {/* Your total points: {totalPoints}<br/> */}
                Points in this round: {matchPoints}<br/>
                Correct answers in this round: {correctCount}/{questionsCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" align="right" color="primary">
                Playing against {props.location.user.nickName}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="stretch" justify="center">
            <Grid item xs={12} sm={12}>
              <Typography variant="h3" align="center">
                {sentence}
              </Typography>
            </Grid>
          <Grid item xs={12} sm={6}>
            <Button id="TrueBTN"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={choosed}
              onClick={()=>{setChoosed(true); setGuess(true); flag = true}}
              fullWidth>
              True
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button id="FalseBTN"
              variant="contained"
              color="secondary"
              className={classes.button}
              disabled={choosed}
              onClick={()=>{setChoosed(true); setGuess(false);  flag = true}}
              fullWidth>
              False
            </Button>
          </Grid>

          
          <Result choosed={choosed} noMoreSentences={noMoreSentences} myturn={myturn}  seenSentences = {seenSentences} guess={guess} ans={ans} opponentId={opponentId} correctCount={correctCount} questionsCount={questionsCount} user={user} room={room} history={history}
          opponentId={opponentId} matchPoints={matchPoints} setChoosed={setChoosed} setMyturn={setMyturn} setQuestionsCount={setQuestionsCount} setCorrectCount={setCorrectCount}/>

          {noMoreSentences && <div>
            <Grid item xs={12} sm={12}>
              {/* <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}> */}
              <Button id="EndGameBTN1"
              variant="contained" color="secondary" fullWidth
              onClick={()=>{
                socket.emit('deliverMessage',{
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
          </div>
          }

          {answered && <Typography variant="h5">
            The opponent answered {opGuess}. He was {opIsCorrect}! <br/>
            Waiting to the opponent to choose whether to continue or not.
            </Typography>}
          
          </Grid>
        </div>          
      </Container>
    );
}

function Result(props){
  let guess = props.guess;
  let setChoosed = props.setChoosed;
  let setCorrectCount = props.setCorrectCount;
  let setQuestionsCount = props.setQuestionsCount;
  let questionsCount = props.questionsCount;
  let correctCount = props.correctCount;

  if(!(props.choosed && !props.noMoreSentences && props.myturn)){
    return (<div/>);
  }


  //var result, isCorrect;
  //var guess_str;
  if (flag){
    setQuestionsCount(questionsCount + 1);
    if (guess)
      guess_str = "true";
    else
      guess_str = "false";
    if (guess == props.ans){
      isCorrect = "right";
      setCorrectCount(correctCount + 1);
      result = "You are right!";
    }
    else{
      isCorrect = "wrong";
      result = "You are wrong...";
    }
    flag = false;
    socket.emit('deliverMessage',{
      message: "displayAnswer",
      receiverId: props.opponentId,
      args: {guess: guess_str,
      isCorrect: isCorrect}
    });
  }
return (
  <Container component="main" maxWidth="sm">
    <div>
      <Grid container spacing={2} justify="center">
        <Typography variant="h2" justify="center">
          <br/>
        {result}
        </Typography>

        <Grid item xs={12} sm={6}>
          <Button id="NextSentenceBTN"
          variant="contained" color="primary" fullWidth
          onClick={()=>{props.setMyturn(false);
            // Very important comment by: Shai.
            // What is this?? What were you trying to do?? This is very unclrear!
            setChoosed(false);
            setChoosed(true);
            socket.emit('deliverMessage',{
            receiverId: props.opponentId,
            message: "continueMatch",
            args: {}
          });
        }}>
            next sentence
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          {/* <Link to={
            {
              pathname: `/JoinGame`,
              userObject: props.user,
              roomObject: props.room
            }
            } style={{ textDecoration: 'none' }}> */}
            <Button id="EndGameBTN"
            variant="contained" color="secondary" fullWidth
            onClick={()=>{ /////////////////// todo: check implementation in backend
              socket.emit('deliverMessage',{
                receiverId: props.opponentId,
                message: "endMatch",
                args: {}
              });
              updateAfterMatchData(props.user, props.room, props.matchPoints, props.history, props.seenSentences)
            }}
            >
              end game
            </Button>
          {/* </Link> */}
        </Grid>
      </Grid>
    </div>
  </Container>
  );
}

function getSentence(truths, lies, seenSentences, setTruths, setLies, setSeenSentences){
  let ans, sentence;
  console.log('inside getSentence')
  console.log(truths)
  console.log(lies)
  console.log(seenSentences)
  if ((Math.floor(Math.random()*2) || lies.length == 0) && truths.length > 0){
    console.log('choosing a true sentence');
    ans = true;
    //let filtered_trues = trues.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random()*truths.length)
    setSeenSentences(seenSentences.concat([truths[i]]));
    sentence = truths[i];
    
    let new_truths = JSON.parse(JSON.stringify(truths));
    new_truths.splice(i, 1);
    setTruths(new_truths);
  }
  else if(lies.length > 0){
    console.log('choosing a false sentence');

    ans = false;
    //let filtered_falses = falses.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random()*lies.length)
    setSeenSentences(seenSentences.concat([lies[i]]));

    sentence = lies[i];
     
    let new_lies = JSON.parse(JSON.stringify(lies));
    new_lies.splice(i, 1);
    setLies(new_lies);
  }
  else {
    console.log('tried to choose a sentence but there are no more sentences');

    sentence = "No more sentences...";
    ans = "";
  }
  return {sentence: sentence, ans: ans};
}

function updateAfterMatchData(user, room, matchPoints, history, seenSentences){
  console.log("update after user points: ", matchPoints)

  let newUser = JSON.parse(JSON.stringify(user));
  newUser.already_seen_sentences = seenSentences
  newUser.score += matchPoints 
  socket.emit('updateUserInRoom', {roomId: room.room_id, user: newUser}) // todo: complete data

  history.push({
    pathname: '/LoginScreen/JoinGame',
    InfoObject: {userObject: newUser, roomObject: room}
  });
}
