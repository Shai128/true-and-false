import React from 'react';
import logo from './logo.svg';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

function App() {


  /**style things */
  const useStyles = makeStyles(theme => ({
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

  const classes = useStyles();


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>
        <TextField
          id="UserNameInput"
          className={classes.textField}
          label="Filled"
          margin="normal"
          variant="filled"
          //onChange={}
          inputRef={ref => { this.ref= ref; }}
        />
        
        <TextField
          id="PasswordInput"
          label="Password"
          className={classes.textField}
          type="password"
          autoComplete="current-password"
          margin="normal"
          variant="filled"
        />
        </div>
      
        <button onClick={()=>{
          fetch('http://localhost:8000/user', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          credentials: 'include',
          body: 'username=myusername' // body data type must match "Content-Type" header
        
        });
      }}>   
        הוסף משתמש
      </button>
      </header>
      
    </div>
  );
}

export default App;
