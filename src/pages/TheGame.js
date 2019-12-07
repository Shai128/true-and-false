import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {useStyles as AppUseStyles} from './../App.js';

// const io = require('socket.io-client');
// const socket = io('http://localhost:8000');

var points = 0, correct = 0, questions = -1;
var guess, sentence = "", myturn, ans;
var trues, falses, seen;

export function TheGame(props){
    const classes = AppUseStyles();
    const player1 = props.location.player1; // me
    const player2 = props.location.player2; // opponenet
    const [choosed, setChoosed] = React.useState(false);
    const [answered, setAnswered] = React.useState(false);
    const [noMoreSentences, setNoMoreSentences] = React.useState(false);
    if(questions == -1){
      questions = 0;
      myturn = props.turn;
      seen = props.seen;
      seen = ["A true sentence 1", "A false sentence 2"];
      trues = props.trues;
      trues = ["A true sentence 1", "A true sentence 2", "A true sentence 3"];
      trues = trues.filter(x => !seen.includes(x));
      falses = props.falses;
      falses = ["A false sentence 1", "A false sentence 2", "A false sentence 3"];
      falses = falses.filter(x => !seen.includes(x));
      myturn = true;
    }

    var op_guess, op_isCorrect;

    // let tmp = getSentence(trues, falses, seen);
    // sentence = tmp.sentence;
    // ans = tmp.ans;
    if(myturn && sentence == ""){
      let tmp = getSentence();
      sentence = tmp.sentence;
      ans = tmp.ans;
      if(sentence == "No more sentences..."){
        setNoMoreSentences(true);
        setChoosed(false);
      }
      //setMyturn(false);
    }
    else{
      if (!choosed)
        setChoosed(true); // wait for opponent's sentence
    }

    // socket.on('C_displaySentence', function(dispSentence){
    //   sentence = dispSentence;
    //   setChoosed(true);
    // });

    // socket.on('C_displayAnswer', function(data){
    //   op_guess = data.guess;
    //   op_isCorrect = data.isCorrect;
    //   setAnswered(true);
    // });

    // socket.on('C_continueMatch', function(){
    //   setAnswered(false);
    //   myturn = true;
    //   //setChoosed(true);
    // });

    // socket.on('C_endMatch', function(){
    //   io.emit('S_updateAfterMatchData',{
    //     user_id: props.user_id,
    //     sennSentences: seen,
    //     pointsToAdd: points,
    //     room_id: props.room_id
    //   });
    // });


    return (
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper} >
          <Grid container>
            <Grid item>
              <Typography variant="h6" align="left" color="primary">
                points in this round: {points}<br/>
                correct answers in this round: {correct}/{questions}
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
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={choosed}
              onClick={()=>{setChoosed(true); guess = true;}}
              fullWidth>
              True
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button id="false"
              variant="contained"
              color="secondary"
              className={classes.button}
              disabled={choosed}
              onClick={()=>{setChoosed(true); guess = false;}}
              fullWidth>
              False
            </Button>
          </Grid>

          {choosed && !noMoreSentences && <Result guess={guess} setChoosed={setChoosed} ans={ans}/>}

          {noMoreSentences && <div>
            <Grid item xs={12} sm={12}>
              {/* <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}> */}
              <Button variant="contained" color="secondary" fullWidth
              // onClick={()=>{
              //   io.emit('deliverMessage',{
              //   receiverId: props.user_id
              //   message: endMatch
              //   args: {}
              // });
              // }}
              >
                end game
              </Button>
              {/* </Link> */}
            </Grid>
          </div>
          }

          {/* {answered && <Typography variant="h5">
            The opponent answered {op_guess}. He was {op_isCorrect}! <br/>
            Waiting to the opponent to choose whether to continue or not.
            </Typography>} */}
          
          </Grid>
        </div>          
      </Container>
    );
}

function Result(props){
  let guess = props.guess;
  let setChoosed = props.setChoosed;
  var result, isCorrect;
  var guess_str;
  questions++;
  if (guess)
    guess_str = "true";
  else
    guess_str = "false";
  if (guess == props.ans){
    isCorrect = "right";
    correct++;
    points += 2;
    result = "You are right!";
  }
  else{
    isCorrect = "wrong";
    points += 1;
    result = "You are wrong...";
  }
  // io.emit('S_passAnswer',{
  //   user_id: props.user_id,
  //   guess: guess,
  //   correct: isCorrect
  // });
return (
  <Container component="main" maxWidth="sm">
    <div>
      <Grid container spacing={2} justify="center">
        <Typography variant="h2" justify="center">
          <br/>
        {result}
        </Typography>

        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth
          onClick={()=>{setChoosed(false);
            sentence = ""; ///////////////////////////////
          //   io.emit('S_continueMatch',{
          //   user_id: props.user_id
          // });
        }}>
            next sentence
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          {/* <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}> */}
            <Button variant="contained" color="secondary" fullWidth
            // onClick={()=>{
            //   io.emit('S_endMatch',{
            //   user_id: props.user_id
            // });
            // }}
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

  if (Math.floor(Math.random()*2) && trues.length > 0){
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
  // io.emit('S_passSentence',{
  //   user_id: user_id,
  //   sentence: sentence
  // });
  return {sentence: sentence, ans: ans};
}

