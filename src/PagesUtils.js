import React from 'react';
import ReactLoading from "react-loading";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
      Link,
      useHistory,
  } from "react-router-dom";
//import {isUndefined} from './Utils.js';

import ChatIcon from '@material-ui/icons/Chat';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {socket, getUserFromProps} from './user.js';
import {useStyles} from './App.js';
import {joinRoom} from './room.js';
export function PrintGames(props){
    const games =props.games;
    const classes = props.classes;
    const user = getUserFromProps(props);
    let url = props.url;
    return (<List className={classes.list}>
          {games.map(({ name, id, date, playersNum }) => (
            <React.Fragment key={id}>
              <Link to={
                {
                  pathname: `${url}/GamePage/`+id,
                  game: games[id],
                  user: user,
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

export function DisplayLoading(){
  return (
    <div
     style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
    }}>

  <ReactLoading type={"bars"} color={"#000"} height={667} width={375} />
    </div>
  );
}

export function PrintJoinGameDialog(props){  
  const {handleCloseWindow,  WindowOpen, currentUser} = props;
  const [gameID, setGameID] = React.useState("");
  const [currentGameNickName, setCurrentGameNickName] = React.useState(currentUser.nickName);
  const [validGameID, setValidGameID] = React.useState(true);
  const [validNickName, setvalidNickName] = React.useState(true);
  const [nickNameHelperText, setNickNameHelperText] = React.useState('');
  const [gameIDHelperText, setGameIDHelperText] = React.useState('');


  const onCloseWindow = ()=>{
    resetDisplaysContent();
    handleCloseWindow();
  }

  const displayNickNameTaken = ()=>{
    setNickNameHelperText('This nick name is taken');
    setvalidNickName(false);
  }

  const displayWrongGameID = ()=>{
    setGameIDHelperText('Wrong game ID');
    setValidGameID(false);
  }

  const resetDisplaysContent = ()=>{
    setGameIDHelperText('');
    setNickNameHelperText('');
    setvalidNickName(true);
    setValidGameID(true);
  }
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
  let history = useHistory();
  const joinGame = ()=>{
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
      joinRoom(gameID, currentUser, currentGameNickName, history )
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

export function PrintMessages(props){
  
    const useStyles = makeStyles(theme => ({
      root: {
        width: '100%',
        maxWidth: 360,
        overflowX: 'hidden', overflowY: "auto",
        backgroundColor: theme.palette.background.paper,
        overflowWrap: 'break-word',
      },
    }));
    const classes = useStyles();
    const url = props.url;
    const messages =props.messages;
    const onPageChange = props.onPageChange;
    const user = getUserFromProps(props);
    var index =0;
    const shortMessage = (message) =>{
      if(message.length >10)
        return message.slice(0,10)+'...';
      return message;
    }
    return (
      <div className={classes.root}>
        <List >
          {messages.map((message) => (
            <React.Fragment key={index++}>
              <Link className={classes.root} to={
                {
                  pathname: `${url}/ChatRoom/`+message.writerEmail,
                  user: user,
                }
              }
              >
              <ListItem className={classes.root} button onClick={onPageChange}>
                <ListItemText primary={message.author + ": "+shortMessage(message.content)} /*secondary={date}*/ />
              </ListItem>
              </Link>
            </React.Fragment>
          ))}
        </List>
      </div>
        );

}



export function PrintChats(props){
  var chats =props.chats;
  const classes = useStyles();
  const user = getUserFromProps(props);
  let index =0;
  var obj = {};
  chats.reverse();

  for ( let i=0, len=chats.length; i < len; i++ )
      obj[chats[i].otherUserEmail] = chats[i];
  chats=[];
  for ( let key in obj )
    chats.push(obj[key]);
  chats.reverse();
  return (<List className={classes.list}>
        {chats.map((chat) => (
          
          <React.Fragment key={index++}>
            <Link to={
              {
                pathname: `/LoginScreen/ChatRoom/`+chat.otherUserEmail,
                user: user,
              }
            }
            >
            <ListItem button >
              <ListItemText primary={chat.otherUserEmail} secondary={
                
                (chat.authorEmail === user.email? 'You: ' : (chat.authorName +": ")) +
                  chat.messageContent
                } />
            </ListItem>
            </Link>
          </React.Fragment>
        ))}
      </List>);
}

export function ChatButton(props){

  return (
      <ListItem button>
          <Link to={
          {
            pathname: `/LoginScreen/ChatRoom/`+props.email,
            user: props.user
          }
        }>
      <Grid container alignContent='center' direction='column' alignItems='center' justify='center'>
      <Grid item xs={5}>
        <ListItemIcon >
          <ChatIcon />
        </ListItemIcon>
        </Grid>
        <Grid item xs={7}>
        <ListItemText primary="Chat"/>
        </Grid>
        </Grid>
        </Link>
        </ListItem>
      
  );
}