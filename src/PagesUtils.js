import React from 'react';
import Container from '@material-ui/core/Container';

import ReactLoading from "react-loading";
import CssBaseline from '@material-ui/core/CssBaseline';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography'
import {
      Link,
      useHistory,
  } from "react-router-dom";
import {isUndefined} from './Utils.js';

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
import {socket, getUserFromProps, getCurrentUserFromDB} from './user.js';
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


/**
 * display a db error message and displaying a return-back-to-home button
 */
export function DisplayDBError(){


  return (

    <div className="App" >
          <header className="App-header" >
          <Container component="main" maxWidth="xs">
            <CssBaseline />

              <Typography variant="h4" style={{color:'black', marginBottom: '30px', width:'100%'}}>
              An error occured. Could not read from DB.
              </Typography>

              <Link to="/LoginScreen">
                <Button variant="contained" color="primary" fullWidth>
                Return to home screen
            </Button>
              </Link> 

          </Container>
          </header>
          
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
      <Dialog id = "openRoomPopUp" open={WindowOpen} onClose={onCloseWindow} aria-labelledby="form-dialog-title">
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
          id="room_id"
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
        <Button id="cancelBTN" onClick={onCloseWindow} color="primary">
          Cancel
        </Button>
        <Button id="startBTN" onClick={joinGame} color="primary">
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
    const user = getUserFromProps(props);
    var index =0;
    const shortMessage = (message) =>{
      if(message.length >10)
        return message.slice(0,10)+'...';
      return message;
    }
    console.log('messages: ', messages);
    let history = useHistory();
    return (
      <div className={classes.root}>
        <List >
          {messages.map((message) => (
            <React.Fragment key={index++}>
              <ListItem id={"message" + index} className={classes.root} button onClick={()=>{
                history.push({
                  pathname: `${url}/ChatRoom/`+message.authorEmail,
                  user: user,
                })
              }}>
                <ListItemText primary={message.authorName + ": "+shortMessage(message.messageContent)} /*secondary={date}*/ />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </div>
        );

}



export function PrintChats(props){
  var messeges_by_addressee  = JSON.parse(JSON.stringify(props.chats));
  
  const classes = useStyles();
  let history = useHistory();
  if(isUndefined(messeges_by_addressee) || messeges_by_addressee.length ===0)
    messeges_by_addressee=[];
  const user = getUserFromProps(props);
  let index =0;
  var chats = [];
  for(let chat of messeges_by_addressee){
    let last_message = chat.messages[ chat.messages.length-1];
    last_message.delivery_timestamp =  Date.parse(last_message.delivery_timestamp)
    chats.push(last_message);
    console.log(last_message);
  }
  chats.sort((message1, message2)=>{return message1.delivery_timestamp<message2.delivery_timestamp? 1: -1});
  return (<List className={classes.list}>
        {chats.map((chat) => (
          
          <React.Fragment key={index++}>
            
            <ListItem button  onClick={()=>{
            history.push({
              pathname: `/LoginScreen/ChatRoom/`+chat.otherUserEmail,
              user: user,
            })
          }} >
              <ListItemText primary={chat.otherUserEmail} secondary={
                
                (chat.authorEmail === user.email? 'You: ' : (chat.authorName +": ")) +
                  chat.messageContent
                } />
            </ListItem>
          </React.Fragment>
        ))}
      </List>);
}

/**
 * 
 * @param {email - the email of the other user. user: current user (not neccessary)} props 
 */
export function ChatButton(props){
  let history = useHistory();
  return (
      <ListItem id = {props.id} button onClick={()=>{history.push({
        pathname: `/LoginScreen/ChatRoom/`+props.email,
        user: props.user
      })}}>
         
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
        </ListItem>
      
  );
}

export function AutoRedirectToLoginScreenIfUserInSession(history){
  getCurrentUserFromDB(()=>{}, ()=>{

    var locationArr = history.location.pathname.split("/");
    var len = locationArr.length;
    var page = locationArr[len-1];
    if( page === 'SignIn' || page === '' || page === 'SignUp'){
      history.push({
        pathname: '/LoginScreen',
      });

  }});
}