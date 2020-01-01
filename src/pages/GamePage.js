import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import PersonIcon from '@material-ui/icons/Person';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Button from '@material-ui/core/Button';
import { DisplayLoading } from './../PagesUtils'
import { getCreatedGames, getParticipatedGames, getUserFromProps, getCurrentUserFromSession } from './../user.js';
import {
  //BrowserRouter as Router,
  //Switch,
  //Route,
  //Link,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import { ChatButton } from './../PagesUtils.js';
import { isUndefined } from './../Utils.js'
export function GamePage(props) {
  const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      margin: 8,
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      // height: 240,
    },
    button: {
      background: props =>
        props.color = 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      paddingLeft: '0pt',
      boxShadow: props =>
        props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
      color: 'white',
      height: 48,
    },

  }));
  let { url } = useRouteMatch();
  const path_array = url.split("/");
  let index = path_array[path_array.length - 1];
  const classes = useStyles();
  const [game, setGame] = useState(props.location.game);
  const [user, setUser] = useState(getUserFromProps(props));
  const [badGameIndex, setBadGameIndex] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  getCurrentUserFromSession(user, setUser, (u) => {
    if (isUndefined(u.gameHistory) || isUndefined(u.gameHistory[index])) {
      setIsLoading(false)
      setBadGameIndex(true);
      return;
    }
    setGame(u.gameHistory[index]);
    setIsLoading(false)
  });
  let history = useHistory();
  if (badGameIndex)
    return (
      <div className="App" >
        <header className="App-header" >
          <Container component="main" maxWidth="xs">
            <CssBaseline />

            <Typography variant="h4" style={{ color: 'black', marginBottom: '30px', width: '100%' }}>
              Invalid game index
              </Typography>

            <Button
              onClick={() => {
                history.goBack();
              }}
              variant="contained" color="primary" fullWidth className={classes.button}>
              Return to last page
            </Button>

          </Container>
        </header>

      </div>
    );

  if (isLoading) {
    return (<DisplayLoading />);
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <Paper className={classes.paper}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography component="h2" variant="h3" justify="center">
              {game.room_name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="h4" variant="h4" justify="center">
              {game.date}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <PrintPlayers players={game.users_in_room} user={user} />
      </Paper>

    </Container>
  );

};



function PrintPlayers(props) {

  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }));
  const players = props.players;
  const classes = useStyles();
  let initial_open = players.slice();
  initial_open.fill(false);
  const [open, setOpen] = React.useState(initial_open);
  const [playerInfoDialogOpen, setPlayerInfoDialogOpen] = React.useState(initial_open);
  const [user, setUser] = React.useState(getUserFromProps(props));
  getCurrentUserFromSession(user, setUser);
  const openPlayerWindow = (index) => {
    let new_arr = playerInfoDialogOpen.slice();
    new_arr[index] = true;
    setPlayerInfoDialogOpen(new_arr);
  }


  const closePlayerWindow = (index) => {
    let new_arr = playerInfoDialogOpen.slice();
    new_arr[index] = false;
    setPlayerInfoDialogOpen(new_arr);
  }
  return (<List className={classes.root}>
    {players.map((player) => {
      player.nickName = isUndefined(player.nickName) ? player.nickname : player.nickName
      var index = players.indexOf(player);
      var openThisPlayerWindow = () => openPlayerWindow(index);
      var closeThisPlayerWindow = () => closePlayerWindow(index);
      return (
        <React.Fragment key={index}>
          <ListItem button onClick={() => {
            let new_open = open.slice();
            new_open[index] = !open[index];
            setOpen(new_open);
          }}>
            <ListItemText primary={player.nickName} secondary={player.email} />
            {open[index] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={open[index]} timeout="auto" unmountOnExit>
            <ListItem className={classes.nested}  >
              <Grid container spacing={5}>
                <Grid item xs={5}>
                  <ChatButton email={player.email} user={user} />
                </Grid>
                <Grid item xs={5}>
                  <ListItem button onClick={openThisPlayerWindow}>
                    <Grid container alignContent='center' direction='column' alignItems='center' justify='center'>
                      <Grid item xs={5}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                      </Grid>
                      <Grid item xs={7}>
                        <ListItemText primary="Profile" />
                      </Grid>
                    </Grid>
                  </ListItem>
                  <PrintPlayerInfo
                    windowOpen={playerInfoDialogOpen[index]}
                    handleCloseWindow={closeThisPlayerWindow}
                    player={player} />
                </Grid>
              </Grid>
            </ListItem>
          </Collapse>
        </React.Fragment>
      )
    })}
  </List>);
}

function PrintPlayerInfo(props) {

  const { handleCloseWindow, windowOpen, player } = props;

  const useStyles = makeStyles(theme => ({
    root: {
      //margin: 8,
      //padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
  }));

  const classes = useStyles();
  const onCloseWindow = () => {
    handleCloseWindow();
  }

  let texts_variant = 'h6';
  return (
    <Dialog open={windowOpen} onClose={onCloseWindow} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{player.nickname}</DialogTitle>
      <DialogContent>
        <DialogContentText>
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography component="h4" variant={texts_variant}>
              First Name:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.root}>
              <Typography component="h4" variant={texts_variant} className={classes.root}>
                {/**todo: remove this trinary operator */}
                {player.firstName === undefined || player.firstName === '' ? 'should not print this' : player.firstName}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography component="h4" variant={texts_variant}>
              Email:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.root}>
              <Typography component="h4" variant={texts_variant} className={classes.root}>
                {player.email}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography component="h4" variant={texts_variant}>
              Nick Name:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.root}>
              <Typography component="h4" variant={texts_variant} className={classes.root}>
                {player.nickname}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseWindow} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>

  );
}


