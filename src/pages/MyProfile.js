import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';


import {useStyles as AppUseStyles} from './../App.js';

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





export function MyProfile(){
    const classes = AppUseStyles();
    const buttonClasses = useButtonStyles();
    let user = getUser();
    
    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper} >
          <Typography component="h1" variant="h2" justify="center">
            My Profile
          </Typography>

          <form className={classes.form} noValidate>
         
          <Grid container spacing={2}>  
          <Grid item xs={12} >
                
            <Typography component="h3" variant="h5" justify="center">
                    Account Settings
            </Typography>
                <Divider/>
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
                value={user.nickName}
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
                value={user.email}
                
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
                value={user.password}

              />
            </Grid>
            

            <Grid item xs={12} >

              <Button className={buttonClasses.root} fullWidth
              onClick={()=>{
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
                }
            }>
              Save
              </Button>

              </Grid>
              </Grid>
            
              </form>      
                  
        </div>


      </Container>

    );

}

function getUser(){
    return {
        email: "email@gmail.com",
        nickName: 'nickname',
        password: 'password',
        truths: [{id: 0, value:"My name is Alon"}, {id: 1,value:"I have Pizza"}],
        lies: [{id:0, value:"I love computer science"}, {id:1, value:"this is a lie"}]
    }
}
