import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
//import socketIOClient from 'socket.io-client';

import {useStyles as AppUseStyles} from './../App.js';

const io = require('socket.io-client');
const socket = io('http://localhost:8000');

const useButtonStyles = makeStyles({
    root: {
      background: props =>
        props.color ='linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      paddingLeft: '0pt',
      boxShadow: props =>
        props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
      color: 'white',
      height: 48,
      //padding: '0 30px',
      //margin: 8,
    },
  });





export function Chat(){
    const classes = AppUseStyles();
    const buttonClasses = useButtonStyles();
 
    let this_user = getCurrentUser();
    let other_user = getOtherUser();
    const [chatContent, setChatContent] = React.useState('');
    const [currentMessage, setCurrentMessage] = React.useState('');
    socket.on('chat', function(data){
        console.log(data);
        setChatContent(data.chatContent + "\n" + data.author + ": " + data.messageContent);
    })
    

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />

        <div className={classes.paper} >
        <Grid container spacing={2}>  

        <Grid item xs={12} >
                
        <Typography component="h4" variant="h4" justify="flex-end">
            {other_user.nickName}
          </Typography>
          
        </Grid>
        <Grid item xs={12} >

        {/**chat window */}
         <TextField
          value={chatContent}
         />

        </Grid>

        
            

            <Grid item xs={10} >
                <TextField
                //variant="outlined"
                required
                fullWidth
                id="message"
                name="message"
                autoComplete="message"
                value={currentMessage}
                onChange={(event)=>{
                    setCurrentMessage(event.target.value);
                }}
              />
              </Grid>
              <Grid item xs={2} >
              <Button className={buttonClasses.root} fullWidth
              onClick={()=>{
                socket.emit('chat',{
                    author: this_user.nickName,
                    messageContent: currentMessage,
                    chatContent: chatContent,
                    user: this_user,
                    receiverUser: other_user,
                });
                setCurrentMessage('');
                }
            }>
              <SendIcon/>
              </Button>
              </Grid>
</Grid>
</div>
</Container>


    );

}

function getCurrentUser(){
    return {
        socketID: socket.id,
        email: "shai@gmail.com",
        nickName: 'Shai',
        password: 'password',
        truths: [{id: 0, value:"My name is Alon"}, {id: 1,value:"I have Pizza"}],
        lies: [{id:0, value:"I love computer science"}, {id:1, value:"this is a lie"}]
    }
}

function getOtherUser(){
    return {
        socketID: socket.id,
        email: "sagi@gmail.com",
        nickName: 'Sagi',
        password: 'password',
        truths: [{id: 0, value:"My name is Alon"}, {id: 1,value:"I have Pizza"}],
        lies: [{id:0, value:"I love computer science"}, {id:1, value:"this is a lie"}]
    }
}
