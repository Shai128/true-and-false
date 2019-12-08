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
import {GamePage} from './GamePage.js';
import {userIsUpdated, getCreatedGames, getParticipatedGames, getCurrentUserFromSession as getCurrentUser, getUserFromProps} from './../user';
import {PrintGames, PrintJoinGameDialog, DisplayLoading} from './../PagesUtils';
import {createRoom} from './../room.js'
export function LoginScreenHome(props){
    let { path, url } = useRouteMatch();
    let user = getUserFromProps(props);
    return(
        <Switch>

        <Route exact path={path}>
        <Home path = {path} url = {url} user={user}/>
        </Route>

        <Route path={`${path}/GamePage/:id`} exact component={GamePage} user={user} />

        </Switch>

    );
}

function Home(props){
    let url = props.url;
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
        props.color ='linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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
    
    if(!userIsUpdated(currentUser)){
      return (<DisplayLoading/>);
    }

    return (

        <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Paper className={fixedHeightPaper}>
            <Grid container spacing={3}>
            <Grid item xs={12}>

            <Typography component="h1" variant="h2" justify="center">
              Welcome {currentUser.email}!
        </Typography>
            </Grid>
        <Grid item xs={12} sm={6}>

        <Button variant="contained" color="primary" fullWidth  className={classes.button} onClick={handleClickCreateGameWindow}>
                Create a New Game
        </Button>   

        <PrintCreateGameDialog
            handleCloseCreateGameWindow= {handleCloseCreateGameWindow}
            createGameWindowOpen= {createGameWindowOpen}
            currentUser={currentUser}/>
        </Grid>

        <Grid item xs={12} sm={6}>
        <Button variant="contained" color="primary" fullWidth  className={classes.button}
        onClick={handleClickJoinGameWindow}>
                Join a Game
        </Button>   
        <PrintJoinGameDialog
        handleCloseWindow= {handleCloseJoinGameWindow}
        WindowOpen= {joinGameWindowOpen}
        currentUser = {currentUser}/>
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
          <Divider/>
            </Grid>

            <Grid item xs={12}>
                <ShowLastTwoGames url={url} />
            </Grid>

            </Grid>
            </Paper>
            </Grid>
            </Grid>

          </Container>

    );

}

function getTwoRecentGames(){
  let participated = getParticipatedGames().slice(0);
  let created = getCreatedGames().slice(0);
  let games_num = created.length > participated.length? created.length :  participated.length;
  let recent_games = [];
  let games_to_add = 2;
  
  for(let games_added=0;games_added<games_to_add; games_added++){
      if(games_num-games_added<=0)
        return recent_games;
      let game_index = games_num - games_added-1;
      if (typeof created[game_index] !== 'undefined')
        recent_games.push(created[game_index]);
      else
        recent_games.push(participated[game_index]);
  }
  
  return recent_games;
    
  
}


function ShowLastTwoGames(props){


const usegameListItemsStyles = makeStyles(theme=>({
          gamesListItems: {
          background: props =>
            props.color ='linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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

    const games = getTwoRecentGames();
    const classes = usegameListItemsStyles();
    let url = props.url;
    return (<PrintGames games={games} classes={classes} url={url}/>);
    
}


function PrintCreateGameDialog(props){
    const {handleCloseCreateGameWindow,  createGameWindowOpen, currentUser} = props;
    const [gameName, setGameName] = React.useState("");
    const [currentGameNickName, setCurrentGameNickName] = React.useState(currentUser.nickName);
    let history = useHistory();
    const startGame = ()=>{
/*
        //var user = //todo- get user from session
        var roomData = {
          roomName: gameName,
          user: user
        }

        socket.on('roomOpened', function(roomID){
          //todo- redirect to room page
        });

        socket.emit('openRoom', roomData)
*/
        

        console.log("starting game!");
        console.log("game name:", gameName);
        console.log('user nickname: ', currentGameNickName);
        createRoom(gameName, currentUser, currentGameNickName, history);
        //handleCloseCreateGameWindow();
        //todo: redirect to room page
    }
    return(
        <Dialog open={createGameWindowOpen} onClose={handleCloseCreateGameWindow} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create a Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <Grid container spacing={2}>
          <Grid item xs={12}>
          <TextField
            autoFocus
            margin="dense"
            id="roomName"
            label="Room Name"
            onChange={(event)=>{
                setGameName(event.target.value);
            }}
          />
          </Grid>
          <Grid item xs={12}>
          <TextField
            autoFocus
            margin="dense"
            id="nickName"
            label="Nick Name"
            defaultValue={currentUser.nickName}
            onChange={(event)=>{
                setCurrentGameNickName(event.target.value);
            }}
          />
          </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateGameWindow} color="primary">
            Cancel
          </Button>
          <Button onClick={startGame} color="primary">
                Start
          </Button>
        </DialogActions>
      </Dialog>

    );
}




