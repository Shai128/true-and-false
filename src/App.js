import React from 'react';
import logo from './logo.svg';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

function App() {

  /*style things */
  const useTextStyles = makeStyles(theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
  }));

  const useButtonStyles = makeStyles(theme => ({
    button: {
      margin: theme.spacing(1),
    },
    input: {
      display: 'none',
    },
  }));

  const useTypographyStyles = makeStyles({
    root: {
      width: '100%',
      maxWidth: 500,
      color: '#000000'
    },
  });

  const textClasses = useTextStyles();
  const buttonClasses = useButtonStyles();
  const typographyClasses = useTypographyStyles();


  return (
    <div className="App" >
      <header className="App-header" >
        <div>
        <Typography variant="h1" component="h2" gutterBottom className={typographyClasses.root}>
        Sign Up
      </Typography>

        <TextField
          id="UserNameInput"
          className={textClasses.textField}
          label="Username"
          margin="normal"
          variant="filled"
        />
        
        <TextField
          id="PasswordInput"
          label="Password"
          className={textClasses.textField}
          type="password"
          autoComplete="current-password"
          margin="normal"
          variant="filled"
        />
        </div>
      
        <Button variant="contained" color="primary" className={buttonClasses.button}
        onClick={()=>{
          let user = {username :document.getElementById('UserNameInput').value,
                      password : document.getElementById('PasswordInput').value }
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
      

      </header>
      
    </div>
  );
}

export default App;
