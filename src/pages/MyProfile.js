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

import { useStyles as AppUseStyles } from './../App.js';
import { getCurrentUserFromSession as getCurrentUser, updateUserToDB, getUserFromProps, validOldPassword, getCurrentUserFromDB } from './../user.js'
import { passwordIsStrongEnough ,colors} from './../Utils.js'
import crypto from "crypto-js";

const useButtonStyles = makeStyles({
  root: {
    background: props =>
      props.color = 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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

function encrypt(str) {
  var newString = "";
  for (var i = str.length - 1; i >= 0; i--) {
    newString += str[i];
  }
  return newString;
}


let pass = "";
let confirm_pass = "";
let old_pass = "";


export function MyProfile(props) {

  const [color,SetColor]=React.useState(false)
  const [index,SetIndex]=React.useState(false)
  const [init,SetInit]=React.useState(false)
    
    if(!init){
      SetInit(true)
    SetColor( colors[Math.floor(Math.random() * colors.length)])
    SetIndex(Math.floor(Math.random() * 3))
  }
  let init_user = getUserFromProps(props);
  let image_init_user = getUserFromProps(props);
  const classes = AppUseStyles();
  const buttonClasses = useButtonStyles();
  const [user, setUser] = React.useState(init_user);
  const [currentUser, setCurrentUser] = React.useState(image_init_user);
  getCurrentUser(user, setUser);
  const [oldUser, setOldUser] = React.useState(user);

  const [changePasswordWindowOpen, setchangePasswordWindowOpen] = React.useState(false);

  const setNewPassword = (new_password) => {
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
  var img = require('../defaultAvatar.png')
  if (currentUser.imageData)
    img = currentUser.imageData.replace(/ /g, "+")
  return (
    <div id="MyProfilePage" style={{  height: '100vh',
      background: 'linear-gradient(100deg, ' + color[index % 3] + ' 30%, rgba(0,0,0,0) 30%),'
        + 'linear-gradient(135deg, ' + color[(index + 1) % 3] + ' 65%, ' + color[(index + 2) % 3] + ' 65%'
    }}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper} >
          <Typography component="h1" variant="h2" justify="center" style={{ color: "white", textShadow: "1px 1px 3px black" }}>
            My Profile
            {/*<img src={`${img}`} width="120" height='120'  border-style='none' />*/}
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


              <Grid container justify='center'  >
                <Button id="changePasswordBTN" className={buttonClasses.root} justify="center" onClick={() => { handleClickChangePasswordWindow(true) }}>
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
                  onClick={() => {
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


  const displayWeakPassword = () => {
    console.log('your password is too weak!');
    setNewPasswordHelperText('this password is too weak');
    setErrorNewPassword(true);
  }

  const displayPasswordSuccessfullyChanged = () => {
    console.log('password saved successfuly!');
    setPasswordChangeMessage('password saved successfuly!');
  }
  const displayPasswordsDontMatch = () => {
    console.log('confirm and new passwords does not match');
    setErrorConfirmPassword(true);
    setConfirmPasswordHelperText('Confirm password and new password does not match');
  }

  const displayWrongOldPassword = () => {
    console.log('wrong old password');
    setErrorOldPassword(true);
    setOldPasswordHelperText('Wrong Old Password');
  }


  const onClickSave = () => {
    console.log("im here")
    console.log(oldUser.password)
    console.log(passwords.enteredOldPassword)
    console.log(oldUser.salt.toString())
    let hashedPassword = crypto.PBKDF2(passwords.enteredOldPassword, oldUser.salt.toString(), { keySize: 512 / 32, iterations: oldUser.iterations }).toString()
    resetDisplaysContent();
    if (!validOldPassword(oldUser.password, hashedPassword)) {
      displayWrongOldPassword();
      return;
    }
    if (pass !== confirm_pass) {
      //if (passwords.enteredConfirmPassword !== passwords.enteredNewPassword) {
      displayPasswordsDontMatch();
      return;
    }
    if (typeof pass === 'undefined' || !passwordIsStrongEnough(pass)) {
      //if (typeof passwords.enteredNewPassword === 'undefined' || !passwordIsStrongEnough(passwords.enteredNewPassword)) {
      displayWeakPassword();
      return;
    }

    // the new given password is valid
    setNewPassword(hashedPassword);
    let user_to_save = oldUser;
    user_to_save.password = hashedPassword;
    setOldUser(user_to_save);
    console.log("im here2")
    console.log(user_to_save)
    updateUserToDB(user_to_save);
    displayPasswordSuccessfullyChanged();
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
                old_pass = e.target.value
                new_passwords.enteredOldPassword = encrypt(old_pass);
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
                pass = e.target.value
                new_passwords.enteredNewPassword = encrypt(pass)
                //new_passwords.enteredNewPassword = e.target.value;
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
                confirm_pass = e.target.value
                new_passwords.enteredNewPassword = encrypt(confirm_pass)
                //new_passwords.enteredConfirmPassword = e.target.value;
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





