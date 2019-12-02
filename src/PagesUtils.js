import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
      Link,
  } from "react-router-dom";
import {isUndefined} from './Utils.js';
import {joinRoom} from './room.js';
import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export function PrintGames(props){
    const games =props.games;
    const classes = props.classes;
    let url = props.url;
    return (<List className={classes.list}>
          {games.map(({ name, id, date, playersNum }) => (
            <React.Fragment key={id}>
              <Link to={
                {
                  pathname: `${url}/GamePage/`+id,
                  game: games[id]
                }
              }
              >
              <ListItem button  className={classes.gamesListItems}>
                <ListItemText primary={name} secondary={date} />
              </ListItem>
              </Link>
            </React.Fragment>
          ))}
        </List>);
}



export function PrintJoinGameDialog(props){  
  const {handleCloseWindow,  WindowOpen, currentUser} = props;
  const [gameID, setGameID] = React.useState("");
  const [currentGameNickName, setCurrentGameNickName] = React.useState(currentUser.nickName);
  const [nick_updated, setNick_updated]=  React.useState(false);
  const [validGameID, setValidGameID] = React.useState(true);
  const [validNickName, setvalidNickName] = React.useState(true);
  const [nickNameHelperText, setNickNameHelperText] = React.useState('');
  const [gameIDHelperText, setGameIDHelperText] = React.useState('');
  

  const onCloseWindow = ()=>{
    resetDisplaysContent();
    handleCloseWindow();
  }

  

  const resetDisplaysContent = ()=>{
    setGameIDHelperText('');
    setNickNameHelperText('');
    setvalidNickName(true);
    setValidGameID(true);
  }
  /*
  socket.on('joinedRoom', function(roomID){
    //todo- redirect to room page (dan't page)
  });

  socket.on('nickNameTaken', function(){
    displayNickNameTaken();
    //todo- open message 'try a different name'
  });

  socket.on('wrongRoomID', function(){
    displayWrongGameID();

  });
  */
  
  const joinGame = ()=>{
    resetDisplaysContent();
    var validData = true;

    var bad_nick = isUndefined(currentGameNickName) || currentGameNickName==='';
    var bad_user = isUndefined(currentUser.nickName) || currentUser.nickName==='';
    if(bad_nick && !nick_updated){
        setCurrentGameNickName(currentUser.nickName);
    }
    if((bad_nick && nick_updated) || bad_user){
        setvalidNickName(false);
        setNickNameHelperText('Please provide a nick name');
        validData = false
    }
    if(isUndefined(gameID) || gameID === ''){
      setGameIDHelperText('Please provide a game ID');
      setValidGameID(false);
      validData = false;
    }
    if(!validData)
      return;

/*
    //var user = //todo- get user from session
    var roomData = {
      roomName: gameName,
      user: user
    }

    
    var user = {
      //todo- get socketID from session
      //socketID: ,
      gameNickName: currentGameNickName
    }
    var data = {
      user: user,
      roomID: gameID
    }

    socket.emit('joinRoom', data);
*/

      console.log("starting game!");
      console.log("game ID:", gameID);
      console.log('user nickname: ', currentGameNickName);
      joinRoom(gameID, currentUser, currentGameNickName);
      //todo: handle taken nick name and wrong ID
      /**
      * const displayNickNameTaken = ()=>{
        setNickNameHelperText('This nick name is taken');
        setvalidNickName(false);
      }

        const displayWrongGameID = ()=>{
        setGameIDHelperText('Wrong game ID');
        setValidGameID(false);
      }
       */
  }
  return(
      <Dialog open={WindowOpen} onClose={onCloseWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Join a Room</DialogTitle>
      <DialogContent>
        <DialogContentText>
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={12}>
        <TextField
          error = {!validGameID}
          helperText={gameIDHelperText}
          autoFocus
          margin="dense"
          id="room id"
          label="Room ID"
          onChange={(event)=>{
            setGameID(event.target.value);
          }}
        />
        </Grid>
        <Grid item xs={12}>

        <TextField
          error={!validNickName}
          helperText={nickNameHelperText}
          autoFocus
          margin="dense"
          id="nickName"
          label="Nick Name"
          defaultValue={currentUser.nickName}
          onChange={(event)=>{
            setNick_updated(true);
              setCurrentGameNickName(event.target.value);
          }}
        />
        </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseWindow} color="primary">
          Cancel
        </Button>
        <Button onClick={joinGame} color="primary">
              Start
        </Button>
      </DialogActions>
    </Dialog>

  );
}