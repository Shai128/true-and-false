import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Popup from "reactjs-popup";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import useState from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import {useStyles as AppUseStyles} from './../App.js';
import Paper from '@material-ui/core/Paper';


export function TheGame(props){
    const classes = AppUseStyles();
    const player1 = props.location.player1; // me
    const player2 = props.location.player2; // opponenet
    const [choosed, setChoosed] = React.useState(false);
    let sentence = "A true or false sentence.";
    return (
        <Container component="main" maxWidth="md">
          <CssBaseline />
          <div className={classes.paper} >

            <Grid container spacing={2} alignItems="stretch" justify="center">
            <Typography variant="h2" align="center">
               {sentence}
            </Typography>
            <Grid item xs={12} sm={6}>
              <Popup
                  trigger={<Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      disabled={choosed}
                      onClick={()=>setChoosed(true)}
                      fullWidth>
                      True
                      </Button>}
                  position="bottom center"
                  closeOnDocumentClick={false}>
                      <div>
                        <Result guess={true, setChoosed}/>
                      </div>
              </Popup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Popup id="p1"    
                  trigger={<Button
                      variant="contained"
                      color="secondary"
                      className={classes.button}
                      disabled={choosed}
                      onClick={()=>setChoosed(true)}
                      fullWidth>
                      False
                      </Button>}
                  disabled={choosed}
                  position="bottom center"
                  closeOnDocumentClick={false}>
                      <div>
                        <Result guess={false, setChoosed}/>
                      </div>
              </Popup>
              </Grid>
            </Grid>

          </div>          
        </Container>
    );
}

function Result(props){
  let guess = props.guess;
  let setChoosed = props.setChoosed;
  let result;
  if (guess)
    result = "You are correct!";
  else
    result = "You are wrong...";
return (
  <Container component="main" maxWidth="xs">
    <div>
      <Grid container spacing={2}>
        <Typography variant="h4" justify="center">
        {result}
        </Typography>

        <Grid item xs={12} sm={2}>
        <Button variant="contained" color="primary"
        onClick={()=>window.location.reload()}>
          continue to next sentence
        </Button>
        </Grid>

        <Grid item xs={12} sm={20}>
        <Link to={{pathname: `/`}} style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="secondary">
            end game
          </Button>
        </Link>
        </Grid>
      </Grid>
    </div>
  </Container>
  );
}
