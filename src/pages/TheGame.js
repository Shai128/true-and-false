import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {JoinGame} from './JoinGame.js'
import { reject } from 'q';

import {useStyles as AppUseStyles} from './../App.js';
import {Link} from "react-router-dom";
import {
  BrowserRouter as Router,
  Route,
  useRouteMatch,
  Redirect,
  useHistory,
} from "react-router-dom";


import {socket} from './../user.js';

const okStatus = 200;

var matchPoints
var totalPoints
var sentenceCheck = ""
var ans, flag = true;
var trues, falses, seen;
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
    
    var tmpMyturn = true
    
    if(questionsCount == -1){
      sentenceCheck = ""
      matchPoints = 0
      totalPoints = user.score
      setCorrectCount(0)
      setQuestionsCount(0);
      setMyturn(props.location.turn);
      tmpMyturn = props.location.turn
      seen = user.already_seen_sentences;
      //seen = ["A true sentence 1", "A false sentence 2"];


      // todo: for ron, add the next http request
      fetch('http://localhost:8000/userSentences/' + opponentId + '/' + room.room_id, { 
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      }).then((response) =>{
        if (response.status !== okStatus) {
          reject(response.status)
        } else {
          return new Promise(function(resolve, reject) {
            resolve(response.json());
          })
        }}).then(data => {      
          trues = data.truths
          falses = data.lies
          console.log("received data from server: ", data)
        })
        
      //   console.log("trues: ", trues)
      //   console.log("falses: ", falses)

      // let opponentUser = props.location.room.users_in_room.find(user => user.email == opponentId)
      // trues = opponentUser.true_sentences
      // falses = opponentUser.false_sentences

      //trues = props.location.user.true_sentences; 
      //trues = ["A true sentence 1", "A true sentence 2", "A true sentence 3"]; ///// todo: for ron, remove this line
      trues = trues.filter(x => !seen.includes(x));
      //falses = props.location.user.false_sentences;
      //falses = ["A false sentence 1", "A false sentence 2", "A false sentence 3"]; ///// todo: for ron, remove this line
      falses = falses.filter(x => !seen.includes(x));
    }

    matchPoints = correctCount*3 + (questionsCount - correctCount)*1
    totalPoints = user.score + matchPoints

    console.log('myturn: ', myturn, " tmpMyturn: ", tmpMyturn + " sentenceCheck: ", sentenceCheck)
    if(myturn && sentenceCheck == "" && tmpMyturn){
      console.log("got here!")
      setChoosed(false);
      //console.log('sentence before chosing a new one: ' + sentence)
      let tmp = getSentence();
      sentenceCheck = tmp.sentence
      setSentence(tmp.sentence);
      //console.log('sentence after chosing a new one: ' + tmp.sentence + ", " + sentence)
      ans = tmp.ans;
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

    if (!myturn && !choosed){
      sentenceCheck = "Loading...";
      setSentence("Loading...");
      setChoosed(true);
    }

    socket.on('displaySentence', function(args){
      console.log('received displaySentence')
      sentenceCheck = "opponent's turn: ".concat(args.sentence);
      setSentence("opponent's turn: ".concat(args.sentence));
      setChoosed(true);
    });

    socket.on('displayAnswer', function(args){
      setOpGuess(args.guess);
      setOpIsCorrect(args.isCorrect);
      setAnswered(true);
    });

    socket.on('continueMatch', function(args){
      //console.log("continueMatch1: " + myturn + sentenceCheck)
      if (sentenceCheck.startsWith("opponent's turn:")){ // if it is the first time here
        sentenceCheck = ""
        setSentence("");
      }
      setAnswered(false);
      setMyturn(true);
      //console.log("continueMatch2: " + myturn + sentence)
    });

    socket.on('endMatch', function(){
      updateAfterMatchData(user, room, matchPoints, history)
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
                Playing against {props.location.user.nickname}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="stretch" justify="center">
            <Grid item xs={12} sm={12}>
              <Typography variant="h3" align="center">
                <br/>
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
              onClick={()=>{setChoosed(true); setGuess(false); flag = true}}
              fullWidth>
              False
            </Button>
          </Grid>

          {choosed && !noMoreSentences && myturn &&
          <Result guess={guess} ans={ans} opponentId={opponentId} correctCount={correctCount} questionsCount={questionsCount} user={user} room={room} history={history}
          opponentId={opponentId} matchPoints={matchPoints} setChoosed={setChoosed} setMyturn={setMyturn} setQuestionsCount={setQuestionsCount} setCorrectCount={setCorrectCount}/>}

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
              updateAfterMatchData(user, room, matchPoints, history)
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
            //flag = true;
          //  sentence = "";
            //sentence = "Loading..."; ///////////////////////////////
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
              updateAfterMatchData(props.user, props.room, props.matchPoints, props.history)
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

function getSentence(){
  let ans, sentence;
  console.log(trues)
  console.log(falses)
  console.log(seen)
  if ((Math.floor(Math.random()*2) || falses.length == 0) && trues.length > 0){
    ans = true;
    //let filtered_trues = trues.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random()*trues.length)
    seen.push(trues[i]);
    sentence = trues[i];
    trues.splice(i, 1);
  }
  else if(falses.length > 0){
    ans = false;
    //let filtered_falses = falses.filter(x => !seen.includes(x));
    let i = Math.floor(Math.random()*falses.length)
    seen.push(falses[i]);
    sentence = falses[i];
    falses.splice(i, 1);
  }
  else {
    sentence = "No more sentences...";
    ans = "";
  }
  return {sentence: sentence, ans: ans};
}

function updateAfterMatchData(user, room, matchPoints, history){
  console.log("update after user points: ", matchPoints)

  let newUser = user
  newUser.already_seen_sentences = seen
  newUser.score += matchPoints 
  socket.emit('updateUserInRoom', {roomId: room.room_id, user: newUser}) // todo: complete data

  history.push({
    pathname: '/JoinGame',
    InfoObject: {userObject: newUser, roomObject: room}
  });
}
