import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import Divider from '@material-ui/core/Divider';

import {getUserFromProps, getCurrentUserFromSession } from './../user.js';
import {validEmail} from './../Utils.js'
import {PrintChats} from './../PagesUtils.js'
import {
    /*BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    Redirect,*/
    useHistory,
} from "react-router-dom";

export function ChatLobby(props){

    
    const useStyles = makeStyles(theme => ({
      root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
      },
      input: {
        //marginLeft: theme.spacing(1),
        flex: 1,
      },
      iconButton: {
        padding: 10,
      },
      container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
      },
      paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        marginBottom: 10,
      },
      fixedHeight: {
       // height: 240,
      },
    }));

    
    

    const classes = useStyles();
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let history = useHistory();
    const [user, setUser] = React.useState(getUserFromProps(props));

    const [inputEmail, setInputEmail] = React.useState('');
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState(''); 
    const handleClickSearch = (event)=>{
        event.preventDefault();
        setError(false);
        setHelperText('');
        if(!validEmail(inputEmail)){
            setError(true);
            setHelperText('Please provide a valid email');
            return;
        }
        else
            history.push({
                pathname: '/LoginScreen/ChatRoom/'+inputEmail,
                user: user,
                })
    }
    
    getCurrentUserFromSession(user, setUser, ()=>{},()=>{});
    
    return (
        
        <Container maxWidth="lg" className={classes.container}>          
           
        <Paper component="form" className={fixedHeightPaper}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography component="h1" variant="h4">
                        Enter a user's email and start chatting!
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                <TextField
                className={classes.input}
                placeholder="Enter email"
                fullWidth
                variant="outlined"
                error={error}
                helperText={helperText}
                id="email"
                name="email"
                autoComplete="email"
                onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                        handleClickSearch(ev);
                    }
                }
                } 
                onChange={(event)=>{
                    setInputEmail(event.target.value);
                }}
                //inputProps={{ 'aria-label': 'search google maps' }}
                />
                </Grid>
                <Grid item xs={2}>
                    <IconButton /*type="submit"*/ className={classes.iconButton} onClick={handleClickSearch} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Grid>
            </Grid>
       
      </Paper> 

      <Paper component="form" className={fixedHeightPaper}>
      <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography component="h1" variant="h4" justify="center">
                        Recent Chats
                    </Typography>
                    <Divider/>

                </Grid>
                <Grid item xs={12}>
                    <PrintChats chats={user.messeges_by_addressee} user={user}/>
                </Grid>
            </Grid>
        </Paper>

        

        
          </Container>
    );
}

