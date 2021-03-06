import React from 'react';

import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import clsx from 'clsx';
import Divider from '@material-ui/core/Divider';

import {
  useHistory,
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";
import { GamePage } from './GamePage.js';
import { userIsUpdated, getCurrentUserFromSession as getCurrentUser, getUserFromProps } from './../user';
import { PrintGames, PrintJoinGameDialog, DisplayLoading } from './../PagesUtils';
import { createRoom } from './../room.js'
import { isUndefined,colors } from './../Utils.js'
export function LoginScreenHome(props) {
  let { path, url } = useRouteMatch();
  let user = getUserFromProps(props);
  
  return (
    <Switch>

      <Route exact path={path}>
        <Home path={path} url={url} user={user} />
      </Route>

      <Route path={`${path}/GamePage/:id`} exact component={GamePage} user={user} />
    </Switch>

  );
}
const defaultImg = require('../defaultAvatar.png')
function Home(props) {
  let url = props.url;

  const [color,SetColor]=React.useState(false)
  const [index,SetIndex]=React.useState(false)
  const [init,SetInit]=React.useState(false)
    
    if(!init){
      SetInit(true)
    SetColor( colors[Math.floor(Math.random() * colors.length)])
    SetIndex(Math.floor(Math.random() * 3))
  }


  
  const [createGameWindowOpen, setCreateGameWindowOpen] = React.useState(false);
  const [joinGameWindowOpen, setJoinGameWindowOpen] = React.useState(false);

  const handleClickCreateGameWindow = () => {
    setCreateGameWindowOpen(true);
  };

  const handleCloseCreateGameWindow = () => {
    setCreateGameWindowOpen(false);
  };
  const handleClickJoinGameWindow = () => {
    setJoinGameWindowOpen(true);
  };

  const handleCloseJoinGameWindow = () => {
    setJoinGameWindowOpen(false);
  };



  const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      // height: 240,
    },
    button: {
      background: props =>
        props.color = 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      paddingLeft: '0pt',
      boxShadow: props =>
        props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
      color: 'white',
      height: 48,
    },

  }));


  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [currentUser, setCurrentUser] = React.useState(getUserFromProps(props));
  getCurrentUser(currentUser, setCurrentUser);

  if (!userIsUpdated(currentUser)) {
    return (<DisplayLoading />);
  }

  if (!userIsUpdated(currentUser)) {
    return (<DisplayLoading />);
  }
  var img = defaultImg
  if (currentUser.imageData)
    img = currentUser.imageData.replace(/ /g, "+")



/////////////////////



////////////////////
    
  return (
    <div id="LoginScreenHomePage" style={{ height: '100vh',
      background: 'linear-gradient(100deg, ' + color[index % 3] + ' 30%, rgba(0,0,0,0) 30%),'
        + 'linear-gradient(135deg, ' + color[(index + 1) % 3] + ' 65%, ' + color[(index + 2) % 3] + ' 65%'
    }}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={1}>
          <Grid item xs={12}  >
            <Paper className={fixedHeightPaper}>
              <Grid container spacing={3} >
                <Grid item xs={12}>


                  <Typography id="welcomeMessage" component="h1" variant="h2" justify="center" >
                    {/*<img src={`${img}`} width="120" height='120' border-style='none' />*/} Welcome {currentUser.firstName}!
              </Typography>



                </Grid>

                <Grid item xs={12} sm={6}>

                  <Button id="createNewRoomBTN" variant="contained" color="primary" fullWidth className={classes.button} onClick={handleClickCreateGameWindow}>
                    Create a New Game
        </Button>

                  <PrintCreateGameDialog
                    handleCloseCreateGameWindow={handleCloseCreateGameWindow}
                    createGameWindowOpen={createGameWindowOpen}
                    currentUser={currentUser} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button id="joinRoomBTN" variant="contained" color="primary" fullWidth className={classes.button}
                    onClick={handleClickJoinGameWindow}>
                    Join a Game
        </Button>
                  <PrintJoinGameDialog
                    handleCloseWindow={handleCloseJoinGameWindow}
                    WindowOpen={joinGameWindowOpen}
                    currentUser={currentUser} />
                </Grid>

              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper className={fixedHeightPaper}>
              <Grid container spacing={3}>
                <Grid item xs={12}>

                  <Typography component="h4" variant="h4" justify="center">
                    Recent Games
        </Typography>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <ShowLastTwoGames user={currentUser} url={url} />
                </Grid>

              </Grid>
            </Paper>
          </Grid>
        </Grid>

      </Container>
    </div>
  );

}

function getTwoRecentGames(user) {
  let participated = user.gameHistory; /*getParticipatedGames().slice(0);*/
  var participated_len = participated.length
  var recent_games = [];
  if (participated_len >= 2)
    recent_games.push({
      id: participated_len - 2,
      ...participated[participated_len - 2]
    })
  if (participated_len >= 1)
    recent_games.push({
      id: participated_len - 1,
      ...participated[participated_len - 1]
    })

  /*
  let created = getCreatedGames().slice(0);
  let games_num = created.length > participated.length ? created.length : participated.length;
  let recent_games = [];
  let games_to_add = 2;

  for (let games_added = 0; games_added < games_to_add; games_added++) {
    if (games_num - games_added <= 0)
      return recent_games;
    let game_index = games_num - games_added - 1;
    if (typeof created[game_index] !== 'undefined')
      recent_games.push(created[game_index]);
    else
      recent_games.push(participated[game_index]);
  }
  */
  return recent_games;


}


function ShowLastTwoGames(props) {


  const usegameListItemsStyles = makeStyles(theme => ({
    gamesListItems: {
      background: props =>
        props.color = 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      paddingLeft: '0pt',
      boxShadow: props =>
        props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
      margin: 10,
      maxWidth: 360,
    },
    list: {
    },
  }));

  const games = getTwoRecentGames(props.user);
  const classes = usegameListItemsStyles();
  let url = props.url;
  return (<PrintGames games={games} classes={classes} url={url} />);

}


function PrintCreateGameDialog(props) {
  const { handleCloseCreateGameWindow, createGameWindowOpen, currentUser } = props;
  const [gameName, setGameName] = React.useState("");
  const [currentGameNickName, setCurrentGameNickName] = React.useState(currentUser.nickName);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState(false);
  const [roomNameError, setRoomNameError] = React.useState(false);
  const [roomNameHelperText, setRoomNameHelperText] = React.useState('');
  const [nickNameError, setNickNameError] = React.useState(false);
  const [nickNameHelperText, setNickNameHelperText] = React.useState('');

  let history = useHistory();

  const resetDisplay = () => {
    setRoomNameError(false);
    setRoomNameHelperText('');
    setServerError(false);
    setNickNameError(false);
    setNickNameHelperText('');
    setGameName('');
  }
  const validData = (gameName, nickName) => {
    var isValid = true
    if (isUndefined(gameName) || gameName === '') {
      setRoomNameError(true);
      setRoomNameHelperText('Please provide a room name');
      isValid = false;
    }
    if (isUndefined(nickName) || nickName === '') {
      setNickNameError(true);
      setNickNameHelperText('Please provide a nick name');
      isValid = false;
    }

    return isValid;
  }

  const startGame = () => {
    console.log("startGame");
    resetDisplay();
    if (!validData(gameName, currentGameNickName))
      return;

    setIsLoading(true);
    console.log("starting game!");
    console.log("game name:", gameName);
    console.log('user nickname: ', currentGameNickName);
    createRoom(gameName, currentUser, currentGameNickName, history, () => {
      setIsLoading(false);
    },
      (errorStatus) => {
        setIsLoading(false);
        setServerError(true);
      }
    );
  }
  if (isLoading)
    return (<DisplayLoading />);
  return (
    <Dialog id="openRoomPopUp" open={createGameWindowOpen} onClose={handleCloseCreateGameWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Create a Room</DialogTitle>
      <DialogContent>
        <DialogContentText>
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              error={roomNameError}
              helperText={roomNameHelperText}
              margin="dense"
              id="roomName"
              label="Room Name"
              onChange={(event) => {
                setGameName(event.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              error={nickNameError}
              helperText={nickNameHelperText}
              margin="dense"
              id="nickName"
              label="Nick Name"
              defaultValue={currentUser.nickName}
              onChange={(event) => {
                setCurrentGameNickName(event.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            {serverError && <Typography variant="h6" style={{ textAlign: 'center', color: 'red' }}>
              Server error occured.
            </Typography>}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button id="cancelBTN" onClick={handleCloseCreateGameWindow} color="primary">
          Cancel
          </Button>
        <Button id="startBTN" onClick={startGame} color="primary">
          Start
          </Button>
      </DialogActions>
    </Dialog>

  );
}




