import React, { useState } from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from "react-router-dom";

import { LoginScreenRouter as LoginScreen } from './pages/LoginScreen.js';
import { Chat as ChatRoom } from './pages/Chat.js';
import { JoinGame } from './pages/JoinGame.js';
import { PrintJoinGameDialog, DisplayLoading, AutoRedirectToLoginScreenIfUserInSession } from './PagesUtils.js';
import { okStatus, validEmail, passwordIsStrongEnough, isUndefined } from './Utils.js'
import { emptyUser, logIn, validOldPassword } from './user.js'
//import { createBrowserHistory } from '../../../AppData/Local/Microsoft/TypeScript/3.6/node_modules/@types/history';
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link to='/' color="inherit">
        True and False
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>

  );
}



export const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  root: {
    width: '100%',
    maxWidth: 500,
    color: '#000000'
  },
  gamesListItems: {
    background: 'linear-gradient(to right, #4ecdc4, #556270)', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    border: '0',
    borderRadius: 3,
    color: 'white',
    height: 48,
    padding: '0 30px',
    margin: '5px'
  },
  list: {
    marginBottom: theme.spacing(2),
    margin: '5px'
  }
}));



function SignUp() {
  const classes = useStyles();
  const [user, setUser] = useState(emptyUser);
  const initMessages = {
    errorPassword: false,
    errorConfirmPassword: false,
    errorFirstName: false,
    errorEmail: false,
    passwordHelperText: '',
    firstNameHelperText: '',
    emailHelperText: '',
    confirmPasswordHelerText: '',
  }
  const [textsMessages, setTextsMessages] = React.useState(initMessages);
  const updateField = e => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  /*const errorEmail = 'errorEmail', emailHelperText= 'emailHelperText',
   errorPassword='errorPassword', passwordHelperText='passwordHelperText',
   firstNameHelperText='firstNameHelperText', errorFirstName='errorFirstName';
  const changeTextMessage = (error, errorName, helperText, helperTextName) =>{
    setTextsMessages({
      ...textsMessages,
      [errorName]: error,
      [helperTextName]: helperText
    });
  }
*/

  /**
   * returns true is the user is valid or false if it is not.
   * prints error messages accordingly
   */
  const validUser = () => {

    var newTextsMessages = initMessages;

    var isValid = true;
    if (!validEmail(user.email)) {
      newTextsMessages.errorEmail = true;
      newTextsMessages.emailHelperText = "please provide a valid email address"
      //changeTextMessage(true,errorEmail, "please provide a valid email address", emailHelperText);
      isValid = false;
    }

    if (!passwordIsStrongEnough(user.password)) {
      newTextsMessages.errorPassword = true;
      newTextsMessages.passwordHelperText = "please provide a strong password"
      //changeTextMessage(true,errorPassword, "please provide a strong password", passwordHelperText);
      isValid = false;
    }
    if (isUndefined(user.firstName) || user.firstName === '') {
      newTextsMessages.errorFirstName = true;
      newTextsMessages.firstNameHelperText = "please provide a firstName";
      //changeTextMessage(true, errorFirstName, "please provide a firstName", firstNameHelperText);
      isValid = false;
    }
    if (user.confirmPassword !== user.password) {
      newTextsMessages.errorPassword = true;
      newTextsMessages.errorConfirmPassword = true;
      newTextsMessages.confirmPasswordHelerText = "passwords does not match";
      //changeTextMessage(true, errorFirstName, "please provide a firstName", firstNameHelperText);
      isValid = false;
    }
    setTextsMessages(newTextsMessages);
    return isValid;
  }

  let history = useHistory();

  return (
    <div id="SignUpPage">
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
        </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>

              <Grid item xs={12}>
                <TextField
                  error={textsMessages.errorFirstName}
                  helperText={textsMessages.firstNameHelperText}
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="firstName"
                  onChange={updateField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="nickName"
                  label="Nick Name"
                  name="nickName"
                  autoComplete="nickName"
                  onChange={updateField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={textsMessages.errorEmail}
                  helperText={textsMessages.emailHelperText}
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={updateField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={textsMessages.errorPassword}
                  helperText={textsMessages.passwordHelperText}
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={updateField}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  error={textsMessages.errorConfirmPassword}
                  helperText={textsMessages.confirmPasswordHelerText}
                  variant="outlined"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="current-password"
                  onChange={updateField}
                />
              </Grid>


            </Grid>
            <Button
              //type="submit"
              id="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={() => {
                if (!validUser())
                  return;
                // let data = new FormData();
                // data.append( "json", JSON.stringify(user));


                fetch('http://localhost:8000/user', {
                  method: 'POST', // *GET, POST, PUT, DELETE, etc.
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  credentials: 'include',
                  body: 'json=' + JSON.stringify(user)
                }).then((data) => {
                  logIn(user, (data) => {
                    // todo: check if the email is already in the db!!
                    console.log('frontend got data: ', data);
                    if (data.status === okStatus) {
                      history.push("/LoginScreen/MySentences");
                    }
                  });
                })

              }}>

              Sign Up
          </Button>
            <Grid container justify="center">
              <Grid item>
                <Link to="/SignIn" variant="body2">
                  Already have an account? Sign In
              </Link>
              </Grid>
            </Grid>
          </form>
        </div>

      </Container>
    </div>
  );
}

function LinksPage() {
  let history = useHistory();
  AutoRedirectToLoginScreenIfUserInSession(history);
  return (
    <div>
      <Switch>

        <Route exact path="/">
          <Home />
        </Route>

        <Route exact path="/SignIn">
          <SignIn />
        </Route>
        <Route exact path="/SignUp">
          <SignUp />
        </Route>

        <Route path="/LoginScreen">
          <LoginScreen />
        </Route>

        <Route path="/ChatRoom">
          <ChatRoom />
        </Route>


        <Route path="/JoinGame">
          <JoinGame />
        </Route>


      </Switch>
    </div>
  );
}

export default function App() {

  return (
    <Router>

      <LinksPage />
    </Router>


  );

}

function Home() {
  const classes = useStyles();

  const [guestLoginWindowOpen, setguestLoginWindowOpen] = React.useState(false);
  const handleClickGuestLogin = () => {
    setguestLoginWindowOpen(true);
  };

  const handleCloseGuestLoginWindow = () => {
    setguestLoginWindowOpen(false);
  };
  return (
    <div id="TrueAndFalseHomePage">
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h2">
            True and False Home Page
        </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Link to="/SignIn">
                  <Button id="signInBTN" variant="contained" color="primary" fullWidth className={classes.button}>
                    Sign In
            </Button>
                </Link>

              </Grid>
              <Grid item xs={12} sm={6}>
                <Link to="/SignUp">
                  <Button id="signUpBTN" variant="contained" color="primary" fullWidth className={classes.button}>
                    Sign Up
      </Button>
                </Link>
              </Grid>
              {/* 
            <Grid item xs={12} sm={6}>
              <Link to="/LoginScreen">
                <Button variant="contained" color="primary" fullWidth className={classes.button}>
                  LoginScreen
          </Button>
              </Link>
            </Grid> */}

              {/* <Grid item xs={12} sm={6}> */}
              <Button variant="contained" color="primary" fullWidth onClick={handleClickGuestLogin} className={classes.button}>
                Guest Login
            </Button>
            </Grid>
            <PrintJoinGameDialog
              handleCloseWindow={handleCloseGuestLoginWindow}
              WindowOpen={guestLoginWindowOpen}
              currentUser={emptyUser()} />
            {/* </Grid> */}

            {/* 
          <Grid item xs={12} sm={6}>
            <Link to="/ChatRoom">
            <Button variant="contained" color="primary" fullWidth  className={classes.button}>
              Chat
          </Button>
          </Link>
            </Grid> */}


            {/* <Grid item xs={12} sm={6}>
            <Link to="/JoinGame">
            <Button variant="contained" color="primary" fullWidth  className={classes.button}>
              Join A Game
          </Button>
          </Link>
            </Grid> */}

          </form>
          <Box mt={5}>
            <Copyright />
          </Box>
        </div>


      </Container>
    </div>
  );

}

/*

function PrintGuestLoginDialog(props){
  const {handleCloseGuestLoginWindow,  guestLoginWindowOpen} = props;
  const [gameID, setGameID] = React.useState("");
  const [currentGameNickName, setCurrentGameNickName] = React.useState('');

  const startGame = ()=>{
      //todo
      console.log("starting game!");
      console.log("game ID:", gameID);
      console.log('user nickname: ', currentGameNickName);
      handleCloseGuestLoginWindow();
  }
  return(
      <Dialog open={guestLoginWindowOpen} onClose={handleCloseGuestLoginWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Select Room Name</DialogTitle>
      <DialogContent>
        <DialogContentText>
        </DialogContentText>
        <Grid container spacing={2}>
        <Grid item xs={12}>
        <TextField
          autoFocus
          margin="dense"
          id="roomID"
          label="Room ID"
          onChange={(event)=>{
            setGameID(event.target.value);
          }}
        />
        </Grid>
        <Grid item xs={12}>
        <TextField
          autoFocus
          margin="dense"
          id="nickName"
          label="Nick Name"
          onChange={(event)=>{
              setCurrentGameNickName(event.target.value);
          }}
        />
        </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseGuestLoginWindow} color="primary">
          Cancel
        </Button>
        <Button onClick={startGame} color="primary">
              Start
        </Button>
      </DialogActions>
    </Dialog>

  );
}
*/

export function SignIn() {

  const classes = useStyles();
  let history = useHistory();

  const [user, setUser] = useState(emptyUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isWrongLogin, setIsWrongLogin] = useState(false);

  const updateField = e => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };
  if (isLoading)
    return (<DisplayLoading />);
  return (
    <div id="SignInPage">
      <header className="App-header" >

        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <form className={classes.form} noValidate>

              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant="h1" component="h2" gutterBottom className={classes.root}>
                    Sign In
      </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    error={isWrongLogin}
                    id="EmailInput"
                    className={classes.textField}
                    label="Email"
                    margin="normal"
                    variant="filled"
                    fullWidth
                    name='email'
                    value={user.email}
                    onChange={updateField}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>

                  <TextField
                    error={isWrongLogin}
                    id="PasswordInput"
                    label="Password"
                    className={classes.textField}
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="filled"
                    fullWidth
                    name='password'
                    value={user.password}
                    onChange={updateField}
                  />
                </Grid>
                <Grid item xs={12}>

                  <Button id="submit" variant="contained" color="primary" fullWidth className={classes.button}
                    onClick={() => {
                      setIsWrongLogin(false);
                      setIsLoading(true);
                      console.log("sending sign in");

                      logIn(user,
                        (user) => { // onSuccess function
                          setIsLoading(false);
                          console.log('logged in and frontend got data: ', user);
                          history.push("/LoginScreen");
                        },
                        () => { // onFailure funciton
                          setIsLoading(false);
                          setIsWrongLogin(true);
                        });

                    }}>
                    Sign In
      </Button>
                </Grid>
                {isWrongLogin ? 'your email and password does not match' : ''}
              </Grid>
            </form>
          </div>
        </Container>
        <Link to="/SignUp" variant="body2">
          <Typography variant="h6" component="h3" gutterBottom className={classes.root}>
            Don't have an account? Sign Up
                </Typography>
        </Link>





      </header>

    </div>
  );
}



/*
export default App;
*/