import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
      Link,
  } from "react-router-dom";


  import Grid from '@material-ui/core/Grid';

  import Button from '@material-ui/core/Button';
  import TextField from '@material-ui/core/TextField';
  import Dialog from '@material-ui/core/Dialog';
  import DialogActions from '@material-ui/core/DialogActions';
  import DialogContent from '@material-ui/core/DialogContent';
  import DialogContentText from '@material-ui/core/DialogContentText';
  import DialogTitle from '@material-ui/core/DialogTitle';
  import {socket} from './user.js';

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
  const {handleCloseWindow,  WindowOpen, nickName} = props;
  const [gameID, setGameID] = React.useState("");
  const [currentGameNickName, setCurrentGameNickName] = React.useState(nickName);
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
  }
  return(
      <Dialog open={WindowOpen} onClose={onCloseWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Select Room</DialogTitle>
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
          value={currentGameNickName}
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