import React from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function Copyright() {
  return (
 <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="">
        True and False
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
   
  );
}

const useStyles = makeStyles(theme => ({
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
  }
}));



function SignUp() {
  const classes = useStyles();

  return (
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
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="userName"
                label="User Name"
                name="userName"
                autoComplete="userName"
              />
              </Grid>
              <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="nickName"
                label="Nick Name"
                name="nickName"
                autoComplete="nickName"
              />
              </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={()=>{
              let user = {
                userName :document.getElementById('userName').value,
                password : document.getElementById('password').value,
                firstName : document.getElementById('firstName').value,
                lastName : document.getElementById('lastName').value,
                email : document.getElementById('email').value,
                nickName : document.getElementById('nickName').value
                         }
              let data = new FormData();
              data.append( "json", JSON.stringify( user ) );
              fetch('http://localhost:8000/user', {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              credentials: 'include',
              body: 'json='+JSON.stringify( user )
            });
          }}>   
          
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link to="/SignIn" variant="body2">
                Already have an account? Sign In
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      
    </Container>
    
  );
}

function LinksPage(){
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
          <Route exact path="/Home">
            <Home />
          </Route>
        </Switch>
        </div>
  );
}

export default function App() {
  return (
    <Router>
{/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
  
    <LinksPage />
  </Router>
        
         
  );
}

function Home(){
  const classes = useStyles();


  return (
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
            <Button variant="contained" color="primary" fullWidth  className={classes.button}>
            Sign In
            </Button>
            </Link>

            </Grid>
            <Grid item xs={12} sm={6}>
            <Link to="/SignUp">
            <Button variant="contained" color="primary" fullWidth  className={classes.button}>
      Sign Up
      </Button>
      </Link>
            </Grid>
            
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>

    </Container>
    
  );

}

function SignIn() {


  const classes = useStyles();


  return (
    <div className="App" >
      <header className="App-header" >

      {/* <Grid container spacing={2}>
            <Grid item xs={3} sm={6}>
      <Link to="/Home" variant="body2">
               <Button variant="contained" color="secondary" className={classes.button}>
                 Home Page
               </Button>
               </Link>
       </Grid>
  </Grid> 
 */}

       
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
          id="UserNameInput"
          className={classes.textField}
          label="Username"
          margin="normal"
          variant="filled"
        />
        </Grid>
        <Grid item xs={12} sm={6}>

        <TextField
          id="PasswordInput"
          label="Password"
          className={classes.textField}
          type="password"
          autoComplete="current-password"
          margin="normal"
          variant="filled"
        />
     </Grid>
     <Grid item xs={12} justify="flex-end">

        <Button variant="contained" color="primary" fullWidth className={classes.button}
        onClick={()=>{
          let user = {username :document.getElementById('UserNameInput').value,
                      password : document.getElementById('PasswordInput').value }
          let data = new FormData();
          data.append( "json", JSON.stringify( user ) );
          fetch('http://localhost:8000/user', {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          credentials: 'include',
          body: 'json='+JSON.stringify( user )
        });
      }}>   
        Sign In
      </Button>
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