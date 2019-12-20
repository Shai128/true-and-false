import React, {useState, useEffect} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import clsx from 'clsx';
import JsxParser from 'react-jsx-parser'

import Paper from '@material-ui/core/Paper';
import {useStyles as AppUseStyles} from './../App.js';
/*
const io = require('socket.io-client');
const socket = io('http://localhost:8000');
*/
import {
  //BrowserRouter as Router,
  //Switch,
  //Route,
  //Link,
  // useRouteMatch,
  
} from "react-router-dom";
import {createBrowserHistory} from 'history'
import {socket, getCurrentUserFromDB, userIsUpdated, emptyUser, updateUserInLocalStorage, resetUnreadMessagesFromCertainUser} from './../user.js'
import {DisplayLoading} from './../PagesUtils.js'
import {isUndefined} from './../Utils.js'
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

  const useChatStyles = makeStyles(theme => ({
    this_user_paper: {
      color: 'blue',
      //padding: theme.spacing(2),
      overflowY: 'auto',
      overflowX: 'hidden',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      hyphens: "auto",
      width: '90%',
      marginBottom: 5
    },
    another_user_paper: {
      color: 'green',
      //padding: theme.spacing(2),
      overflowY: 'auto',
      overflowX: 'hidden',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      hyphens: "auto",
      width: '90%',
      marginBottom: 5,
      //textAlign: 'right',
      marginLeft: 'auto'
    },
}));

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
      height: 440,
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




export function Chat(props){
    
    const paperClasses = useStyles();
    const fixedHeightPaper = clsx(paperClasses.paper, paperClasses.fixedHeight);
    const chatClasses =useChatStyles();
    let history = createBrowserHistory();
    const path_array = history.location.pathname.split("/");
    var other_user_email = path_array[path_array.length-1];
    const classes = AppUseStyles();
    const buttonClasses = useButtonStyles();
    const [user, setUser] = useState(emptyUser());
    const [lastOtherUserEmail, setLastOtherUserEmail] = useState(other_user_email);  
 
    const [chatContent, setChatContent] = React.useState('');
    const [chatIndex, setChatIndex] = React.useState(-1);
    const [startedReadingFromDB, setStartedReadingFromDB] = React.useState(false);
    const createNewMessageContent = (authorEmail, thisUserEmail, author, messageContent)=>{
      let className = authorEmail === thisUserEmail? 'this_user_style': 'another_user_style';
      let new_message =  `<Paper className={${className}}>`   //todo: should I make it paper instead of div?
      +`<Typography component="h5" variant="h6">`
      + author + ": " + getMessageFromInput(messageContent)
      +'</Typography>'
      +'</Paper>'
       return new_message;
    }

    const getMessageFromInput = (input) =>{
      let message_arr = input.slice().split("");
      let message = "";
      for(const char of message_arr)
        if(char === "<" || char === ">" || char ==='{' || char ==='}')
          message += "{'"+char+"'}"
        else
          message +=char;
        return message;
    }

    const loadMessagesFromUserHistory = (user)=>{
      let chats = user.messeges_by_addressee
      if(isUndefined(chats) || chats.length === 0)
        return;
      var chat;
      var found = false
      let i=0;
      for(chat of chats){
        if(chat.email_of_addressee === other_user_email){
            found=true;
            break;
        }
        i++;
      }
      if(!found)
        return;
      setChatIndex(i);
      let historyChatContent = "";
      for(let message of chat.messages){
         historyChatContent+= '\n'+ createNewMessageContent(message.authorEmail, user.email, message.authorName, message.messageContent);
      }
      setChatContent(historyChatContent);
    }
    if(!startedReadingFromDB){
      setStartedReadingFromDB(true);
      getCurrentUserFromDB(setUser, (user)=>{loadMessagesFromUserHistory(user); scrollToBottomInstantly();}, ()=>{});
    }
    if(lastOtherUserEmail !== other_user_email){
      setUser(emptyUser());
      getCurrentUserFromDB(setUser, (user)=>{loadMessagesFromUserHistory(user); scrollToBottomInstantly();}, ()=>{});
      setLastOtherUserEmail(other_user_email);
    }
    resetUnreadMessagesFromCertainUser(user.email, other_user_email);

    const [currentMessage, setCurrentMessage] = React.useState('');
    const scrollToBottom = () => {
      let node = document.getElementById('endOfChat');
      if(node != null){
        node.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
      }
    };
    const scrollToBottomInstantly = () => {
      let node = document.getElementById('endOfChat');
      if(node != null){
        node.scrollIntoView();
      }
    };

    useEffect(() => {
      if(!userIsUpdated(user))
        return;
        let isCancelled = false;

      socket.off(user.email+'_chat');
      socket.on(user.email+'_chat', function(data){
        let message = getMessageFromInput(data.messageContent);
        if(data.authorEmail !== other_user_email && data.authorEmail !== user.email)
          return;
        resetUnreadMessagesFromCertainUser(user.email, other_user_email);
        let to_append = createNewMessageContent(data.user.email, user.email, data.authorName, message);
        let new_message ={
            delivery_timestamp: Date(),
            authorEmail: data.user.email,
            messageContent: data.messageContent,
            authorName: data.authorName,
            otherUserEmail: other_user_email
        }
        

        if(!isCancelled){
          setChatContent(chatContent + "\n" + to_append);
          if(isUndefined(user.all_last_messages))
            user.all_last_messages = [];
          user.all_last_messages.unshift(new_message);
          user.all_last_messages= user.all_last_messages.slice(0,1000);
          let index = chatIndex;
          if(chatIndex ===-1){
            setChatIndex(0);
            index =0;
          }
          user.messeges_by_addressee[index].messages.push(new_message)
          updateUserInLocalStorage(user);
          scrollToBottom();
        }
    })
    return ()=>{
      isCancelled = true;
    }
  });
    
  
  
    const sendMessage = ()=>{
        // this_user.socketID = socket.id;
        // other_user.socketID = socket.id;//todo: edit....
        socket.emit('chat',{
            authorName: user.nickName, //todo: change to firstName
            messageContent: currentMessage,
            //chatContent: chatContent,
            user: user,
            authorEmail: user.email,
            receiverUserEmail: other_user_email,
        });
        setCurrentMessage('');
    };
    if(!userIsUpdated(user)){
        return (
          <DisplayLoading/>
      );
    }
   
    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        
        <div className={classes.paper}>
        <Grid container spacing={2}>  

        <Grid item xs={12} >
        <Paper>
        <Typography component="h4" variant="h4" justify="flex-end">
            {other_user_email}
        </Typography>
        </Paper> 

        </Grid>
        <Grid item xs={12} >

        {/**chat window */}
        <Paper  className={fixedHeightPaper}>
        
          <div style={{ fontFamily: "inherit",width: '100%',
                        maxWidth: 360,
                        overflowX: 'hidden', overflowY: "auto",
                        }}>
          <JsxParser 
          bindings ={{
            this_user_style: chatClasses.this_user_paper,
            another_user_style: chatClasses.another_user_paper,

          }}
          components={{ Paper, Typography, Button }}
          jsx={chatContent}
          />
          <div id='endOfChat' />

          </div>
        
     
         
          
          
          </Paper>
        </Grid>


        <Grid item xs={9} >
                <TextField
                variant="outlined"
                onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      sendMessage();
                    }
                }
                }
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
              <Grid item xs={3} >
              <Button className={buttonClasses.root} fullWidth
              onClick={sendMessage}>
              <SendIcon/>
              </Button>
              </Grid>
</Grid>
</div>
</Container>


    );

}

/*
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
*/