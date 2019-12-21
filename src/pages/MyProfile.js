import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {useStyles as AppUseStyles} from './../App.js';
import {getCurrentUserFromSession as getCurrentUser, updateUserToDB, getUserFromProps, validOldPassword} from './../user.js'
import {passwordIsStrongEnough } from './../Utils.js'
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





export function MyProfile(props){
    let init_user = getUserFromProps(props);
    const classes = AppUseStyles();
    const buttonClasses = useButtonStyles();
    const [user, setUser] = React.useState(init_user);
    getCurrentUser(user, setUser);
    const [oldUser, setOldUser] = React.useState(user);

    const [changePasswordWindowOpen, setchangePasswordWindowOpen] = React.useState(false);

    const setNewPassword = (new_password) =>{
      let new_user = user;
      new_user.password = new_password;
      setUser(new_user);
    }
    const handleCloseChangePasswordWindow = () => {
      setchangePasswordWindowOpen(false);
    };
    const handleClickChangePasswordWindow = () => {
      setchangePasswordWindowOpen(true);
    };
    const updateField = e => {
      setUser({
        ...user,
        [e.target.name]: e.target.value
      });
    };
    return (
      <div id="MyProfilePage">
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
                <Divider />
              </Grid>

              <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="firstName"
                value={user.firstName}
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
                value={user.nickName}
                onChange={updateField}
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
                onChange={updateField}                
              />
            </Grid>
            <Grid container  justify='center'  >
            <Button id="changePasswordBTN" className={buttonClasses.root} justify="center" onClick={()=>{handleClickChangePasswordWindow(true)}}>
              Change Password
            </Button>

                <PrintChangePassword
                  handleCloseWindow={handleCloseChangePasswordWindow}
                  WindowOpen={changePasswordWindowOpen}
                  setNewPassword={setNewPassword}
                  oldUser={oldUser}
                  setOldUser={setOldUser}
                />

              </Grid>



            <Grid item xs={12} >
              <Button id="saveBTN"
              className={buttonClasses.root} 
              fullWidth
              type="submit"
              onClick={()=>{
                    updateUserToDB(user);
                    setOldUser(user);
                  }
                  }>
                  Save
              </Button>

              </Grid>
            </Grid>

          </form>

        </div>


      </Container>
    </div>
  
  );

}

function PrintChangePassword(props) {
  const { handleCloseWindow, WindowOpen, setNewPassword, oldUser, setOldUser } = props;
  const [passwords, setPasswords] = React.useState({});
  const [errorOldPassword, setErrorOldPassword] = React.useState(false);
  const [errorNewPassword, setErrorNewPassword] = React.useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = React.useState(false);

  const [oldPasswordHelperText, setOldPasswordHelperText] = React.useState('');
  const [newPasswordHelperText, setNewPasswordHelperText] = React.useState('');
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] = React.useState('');

  const [passwordChangeMessage, setPasswordChangeMessage] = React.useState('');


  const onCloseWindow = () => {
    resetDisplaysContent();
    handleCloseWindow();
  }

  // reset errors (red border) + reset text helpers
  const resetDisplaysContent = () => {
    setErrorOldPassword(false);
    setErrorNewPassword(false);
    setErrorConfirmPassword(false);
    setConfirmPasswordHelperText(' ');
    setNewPasswordHelperText(' ');
    setOldPasswordHelperText(' ');
    setPasswordChangeMessage('');
  }


  const onClickSave = () => {
    resetDisplaysContent();
    if (!validOldPassword(oldUser.password, passwords.enteredOldPassword)) {
      displayWrongOldPassword();
      return;
    }
    if (passwords.enteredConfirmPassword !== passwords.enteredNewPassword) {
      displayPasswordsDontMatch();
      return;
    }


    const onClickSave = ()=>{
      resetDisplaysContent();
      if(!validOldPassword(oldUser.password, passwords.enteredOldPassword)){
        displayWrongOldPassword();
        return;
      }
      if(passwords.enteredConfirmPassword !== passwords.enteredNewPassword){
        displayPasswordsDontMatch();
        return;
      }

      if(typeof passwords.enteredNewPassword === 'undefined' || !passwordIsStrongEnough(passwords.enteredNewPassword)){
        displayWeakPassword();
        return;
      }

      // the new given password is valid
      setNewPassword(passwords.enteredNewPassword);
      let user_to_save =  oldUser;
      user_to_save.password = passwords.enteredNewPassword;
      setOldUser(user_to_save);
      updateUserToDB(user_to_save);
      displayPasswordSuccessfullyChanged();
    }
    const displayWrongOldPassword = ()=>{
      console.log('wrong old password');
      setErrorOldPassword(true);
      setOldPasswordHelperText('Wrong Old Password');
    }
    const displayPasswordsDontMatch = ()=>{
      console.log('confirm and new passwords does not match');
      setErrorConfirmPassword(true);
      setConfirmPasswordHelperText('Confirm password and new password does not match');
        }

    const displayPasswordSuccessfullyChanged = ()=>{
      console.log('password saved successfuly!');
      setPasswordChangeMessage('password saved successfuly!');
    }

    // the new given password is valid
    setNewPassword(passwords.enteredNewPassword);
    let user_to_save = oldUser;
    user_to_save.password = passwords.enteredNewPassword;
    setOldUser(user_to_save);
    updateUserToDB(user_to_save);
    displayPasswordSuccessfullyChanged();
  }
  const displayWrongOldPassword = () => {
    console.log('wrong old password');
    setErrorOldPassword(true);
    setOldPasswordHelperText('Wrong Old Password');
  }
  const displayPasswordsDontMatch = () => {
    console.log('confirm and new passwords does not match');
    setErrorConfirmPassword(true);
    setConfirmPasswordHelperText('Confirm password and new password does not match');
  }

  const displayPasswordSuccessfullyChanged = () => {
    console.log('password saved successfuly!');
    setPasswordChangeMessage('password saved successfuly!');
  }

  const displayWeakPassword = () => {
    console.log('your password is too weak!');
    setNewPasswordHelperText('this password is too weak');
    setErrorNewPassword(true);
  }
  return (
    <Dialog id="changePasswordPopUp" open={WindowOpen} onClose={onCloseWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
      <DialogContent>
        <DialogContentText>
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField id="oldPasswordId"
              error={errorOldPassword}
              helperText={oldPasswordHelperText}
              variant="outlined"
              required
              fullWidth
              label="old password"
              type="password"
              autoComplete="current-password"
              onChange={(e) => {
                let new_passwords = passwords;
                new_passwords.enteredOldPassword = e.target.value;
                setPasswords(new_passwords);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={errorNewPassword}
              helperText={newPasswordHelperText}
              variant="outlined"
              required
              fullWidth
              label="new password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => {
                let new_passwords = passwords;
                new_passwords.enteredNewPassword = e.target.value;
                setPasswords(new_passwords);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField id="confirmPasswordId"
              error={errorConfirmPassword}
              helperText={confirmPasswordHelperText}
              variant="outlined"
              required
              fullWidth
              label="confirm password"
              type="password"
              autoComplete="current-password"
              onChange={(e) => {
                let new_passwords = passwords;
                new_passwords.enteredConfirmPassword = e.target.value;
                setPasswords(new_passwords);
              }}
            />
          </Grid>
        </Grid>
        <Grid container justify='center'>
          <Typography variant="h5">
            {passwordChangeMessage}
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button id="cancelBTN" onClick={onCloseWindow} color="primary">
          Cancel
        </Button>
        <Button id="confirmBTN" type="submit" onClick={onClickSave} color="primary">
              Save
        </Button>


      </DialogActions>
    </Dialog>




  );

}





