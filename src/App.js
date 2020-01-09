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
import { validEmail, passwordIsStrongEnough, isUndefined, statusCodes } from './Utils.js'
import { emptyUser, logIn, signUp } from './user.js'
import { TheGame } from './pages/TheGame.js'
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

function encrypt(str) {
  var newString = "";
  for (var i = str.length - 1; i >= 0; i--) {
    newString += str[i];
  }
  return newString;
}


export const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(4),
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
    textAlign: 'center',
    width: '100%',
    maxWidth: 500,
    color: '#000000'
  },
  gamesListItems: {
    background: 'linear-gradient(to right, #2bc0e4, #eaecc6);', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    border: '0',
    borderRadius: 3,
    color: 'black',
    height: 48,
    padding: '0 30px',
    margin: '5px'
  },
  list: {
    marginBottom: theme.spacing(2),
    margin: '5px'
  }
}));

let pass = ""


function SignUp() {
  const classes = useStyles();
  const [user, setUser] = useState(emptyUser);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [serverError, setServerError] = useState(false);

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
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      pass = e.target.value
      setUser({
        ...user,
        [e.target.name]: encrypt(pass)
      });
    } else {
      setUser({
        ...user,
        [e.target.name]: e.target.value
      });
    }
  };

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
    //@@@change to pass
    if (!passwordIsStrongEnough(pass)) {
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
                setUserAlreadyExists(false);
                if (!validUser())
                  return;
                // let data = new FormData();
                // data.append( "json", JSON.stringify(user));

                signUp(user, () => {

                  logIn(user, (data) => {
                    // todo: check if the email is already in the db!!
                    console.log('frontend got data: ', data);
                    // console.log('data.status: ', data.status)
                    history.push("/LoginScreen/MySentences");
                  });
                }, (error_status) => {
                  if (error_status === statusCodes.USER_EXISTS) {
                    setUserAlreadyExists(true);
                  }
                  else
                    setServerError(true);

                })
              }}>

              Sign Up
          </Button>
            <Grid container justify="center">
              <Grid item xs={12}>
                {userAlreadyExists && <Typography variant="h6" style={{ color: 'red' }}>
                  That email is taken. Try another.
          </Typography>}
              </Grid>
              <Grid item xs={12}>
                {serverError && <Typography variant="h6" style={{ color: 'red' }}>
                  Server error occured.
          </Typography>}
              </Grid>

            </Grid>
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
        <Route exact path="/TheGame">
          <TheGame />
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

              <Button variant="contained" color="primary" fullWidth onClick={handleClickGuestLogin} className={classes.button}>
                Guest Login
            </Button>
            </Grid>
            <PrintJoinGameDialog
              handleCloseWindow={handleCloseGuestLoginWindow}
              WindowOpen={guestLoginWindowOpen}
              currentUser={emptyUser()} />
          </form>
          <Box mt={5}>
            <Copyright />
          </Box>
        </div>


      </Container>
    </div>
  );

}


export function SignIn() {

  const classes = useStyles();
  let history = useHistory();

  const [user, setUser] = useState(emptyUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isWrongLogin, setIsWrongLogin] = useState(false);
  const [serverError, setServerError] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [passwordHelperText, setPasswordHelperText] = useState('');

  const updateField = e => {
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      pass = e.target.value
      setUser({
        ...user,
        [e.target.name]: encrypt(pass)
      });
    } else {
      setUser({
        ...user,
        [e.target.name]: e.target.value
      });
    }
  };
  const resetDisplay = () => {
    setServerError(false);
    setEmailError(false);
    setPasswordError(false);
    setEmailHelperText('');
    setPasswordHelperText('');
    setIsWrongLogin(false);
  }
  const validUser = (user) => {
    var isValid = true;
    if (!validEmail(user.email)) {
      setEmailError(true);
      setEmailHelperText("Please provide a valid email address")
      isValid = false;
    }
    //@@@ change to pass
    if (!passwordIsStrongEnough(pass)) {
      setPasswordError(true);
      setPasswordHelperText("please provide a strong password");
      isValid = false;
    }
    return isValid;
  }
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
                <Grid item xs={6}>
                  <TextField
                    error={emailError}
                    helperText={emailHelperText}
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
                <Grid item xs={6}>

                  <TextField
                    error={passwordError}
                    helperText={passwordHelperText}
                    id="PasswordInput"
                    label="Password"
                    className={classes.textField}
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="filled"
                    fullWidth
                    name='password'
                    value={pass}
                    onChange={updateField}
                  />
                </Grid>
                <Grid item xs={12}>

                  <Button id="submit" variant="contained" color="primary" fullWidth className={classes.button}
                    onClick={() => {
                      resetDisplay();
                      if (!validUser(user)) {
                        return
                      }
                      setIsLoading(true);
                      console.log("sending sign in");

                      logIn(user,
                        (user) => { // onSuccess function
                          setIsLoading(false);
                          console.log('logged in and frontend got data: ', user);
                          history.push("/LoginScreen");
                        },
                        (status) => { // onFailure funciton
                          console.log("login failed. status: ", status);
                          setIsLoading(false);
                          if (status === statusCodes.PASSWORD_MISMATCH || status === statusCodes.USER_DOES_NOT_EXIST)
                            setIsWrongLogin(true);
                          else
                            setServerError(true);
                        });

                    }}>
                    Sign In
      </Button>
                </Grid>
                <Grid item xs={12}>
                  {isWrongLogin && <Typography variant="h6" style={{ textAlign: 'center', color: 'red' }}>
                    Your email and password does not match.
          </Typography>}

                </Grid>
                <Grid item xs={12}>
                  {serverError && <Typography variant="h6" style={{ textAlign: 'center', color: 'red' }}>
                    Server error occured.
          </Typography>}

                </Grid>
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