import React from 'react';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import { reject } from 'q';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { socket } from '../user.js';
import {
  BrowserRouter as Router,
  useHistory,
} from "react-router-dom";
import ReactLoading from "react-loading";
import MaterialTable from 'material-table';

import CssBaseline from '@material-ui/core/CssBaseline';

import { createBrowserHistory } from 'history'
import { ChatButton } from './../PagesUtils.js';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import { getUserFromProps, getCurrentUserFromSession } from './../user.js';
import { PrintChats } from './../PagesUtils.js'
import { isUndefined, server } from './../Utils.js'


const okStatus = 200;

export function JoinGame(props) {
  // props contains: 
  // userObject: {
  // 	user_id_in_room: ...
  // 	email: ...
  // 	nickname: ...
  // 	true_sentences: ...
  // 	already_seen_sentences: ...
  // 	...more fields you probably don't need...
  // }

  // roomObject: {
  // 	room_id: ...
  // 	room_name: ...
  // 	...more fields you probably don't need...
  // }
  let roomObject;
  if (!isUndefined(props) && !isUndefined(props.location) && !isUndefined(props.location.InfoObject))
    roomObject = props.location.InfoObject.roomObject;
  else
    roomObject = {}

  console.log("the current room is -- >", roomObject);
  const [CurrentRoom, setCurrentRoom] = useState(roomObject);
  const [UpdatingRoom, setUpdatingRoom] = useState(false);
  const [CurrentUser, setCurrentUser] = useState(getUserFromProps(props));
  const [isUpdatedData, setIsUpdatedData] = useState(false);

  getCurrentUserFromSession(CurrentUser, setCurrentUser, (user) => { console.log('got user from session: ', user); setCurrentRoom(user.roomObject); setIsUpdatedData(true) }, () => { });

  const [roomUpdated, setRoomUpdated] = useState(false);

  const [PlayersListOld, setPlayersListOld] = useState([]);

  const [PlayersList, setPlayersList] = useState({
    PlayersAvailable: [],
    PlayersUnAvailable: []
  });

  const [ReturnFromGame, setReturnFromGame] = useState(false);

  if(!ReturnFromGame && (!isUndefined(props) && !isUndefined(props.location) && !isUndefined(props.location.InfoObject)) && !isUndefined(props.location.InfoObject.returnFromGame) && (props.location.InfoObject.returnFromGame)){
    InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
    setReturnFromGame(true);
  }


  // const [PlayersAvailable, setPlayersAvailable] = useState([]);
  // const [PlayersUnAvailable, setPlayersUnAvailable] = useState([]);

  const useStylesRoomName = makeStyles(theme => ({
    title: {
      fontFamily: '"Segoe UI"',
      // fontFamily: 'sans-serif',
      fontWeight: 'bold',
      fontSize: 48,
      marginTop: 0,
      //   width: 600,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roomNumber: {
      fontSize: 36,
      marginTop: 0,
      //    width: 400,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Segoe UI"',
    },
    userTitle: {
      fontSize: 28,
      marginTop: 0,
      //    width: 400,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Segoe UI"',
    },
  }));

  const userStates = {
    INVALID: 0,
    AVAILABLE: 1,
    UNAVAILABLE: 2
  }

  const [GotInvitationWindow, setGotInvitationWindow] = React.useState(false);
  let history = useHistory();
  const classes = useStylesRoomName();
  const [SenderInfoID, setSenderInfoID] = React.useState(-1);
  const [SenderInfoName, setSenderInfoName] = React.useState("");
  const classes1 = useStyles();
  const fixedHeightPaper = clsx(classes1.paper, classes1.fixedHeight);
  const [inputName, setInputName] = React.useState('');
  const [helperText, setHelperText] = React.useState('');
  const [historyListenDefined, setHistoryListenDefined] = React.useState(false)
  var unlisten = () => { };
  let browserHistory = useHistory();

  if (!historyListenDefined) {
    console.log("got here historyListenDefined");
    unlisten = browserHistory.listen((location, action) => {
      console.log('location: ', location)
      console.log('action: ', action)
      // location is an object like window.location
      let arr = location.pathname.split('/');
      let site = arr[arr.length - 1]
      console.log('from join game: site: ', site);
      console.log("the current room:", CurrentRoom)
      if (site === 'JoinGame') {
        socket.emit('changeUserAvailability', {
          newAvailability: userStates.AVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
        })
      }
      else if (site !== 'Home') {
        socket.emit('changeUserAvailability', {
          newAvailability: userStates.UNAVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
        })
      }
    });
    setHistoryListenDefined(true);

  }



  if (!isUpdatedData) {
    return (<DisplayLoadingGame />);
  }
  if (!roomUpdated && isUpdatedData && !UpdatingRoom) {
    console.log("init the room");
    InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
    setUpdatingRoom(true)
  }

  socket.off("userJoined");
  socket.on("userJoined", function (userInfo) {
    /*
       userInfo: {email: ..., nickName:...}
    */
    //  var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersAvailable));
    //  newPlayersAvailable.push({ email: userInfo.email, nickname: userInfo.nickName })
    //  setPlayersAvailable(newPlayersAvailable)

    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));

    const index = (newPlayersAvailable).findIndex(user => user.email === userInfo.email)
    if(index === -1){
      newPlayersAvailable.push({ email: userInfo.email, nickname: userInfo.nickName })
    }
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: PlayersList.PlayersUnAvailable })

  });

  socket.off('userLeft')
  socket.on("userLeft", function (userInfo) {
    console.log("gottt user left")
    /*
       userInfo: {email: ..., nickName:...}
    */

    console.log("user left --->", userInfo)

    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));
    const index = (newPlayersAvailable).findIndex(user => user.email === userInfo.email)
    if(index === -1){
      InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
   }
   else{
    newPlayersAvailable.splice(index, 1)
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: PlayersList.PlayersUnAvailable })
   }

  });

  socket.off('userAvailable')
  socket.on("userAvailable", function (userInfo) {

    //  var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersUnAvailable));
    //  const index = (newPlayersUnAvailable).findIndex(user => user.email === userInfo)
    //  var current_user = newPlayersUnAvailable[index]
    //  newPlayersUnAvailable.splice(index,1)
    //  setPlayersUnAvailable(newPlayersUnAvailable)

    //  var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersAvailable));
    //  newPlayersAvailable.push(current_user)
    //  setPlayersAvailable(newPlayersAvailable)

    console.log(CurrentUser.email, "got user--Available", "userInfo:", userInfo);
    var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersUnAvailable));
    console.log(CurrentUser.email, "got newPlayersUnAvailable ", newPlayersUnAvailable);
    var index = (newPlayersUnAvailable).findIndex(user => user.email === userInfo)
    console.log(CurrentUser.email, "got index ", index);

    if(index === -1){
      InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
     }

   else{
      index = (newPlayersUnAvailable).findIndex(user => user.email === userInfo)
      var current_user = newPlayersUnAvailable[index]
      console.log(CurrentUser.email, "got current user ", current_user);
      newPlayersUnAvailable.splice(index, 1)
      console.log(CurrentUser.email, "got newPlayersUnAvailable ", newPlayersUnAvailable);
      var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));

      index = (newPlayersAvailable).findIndex(user => user.email === current_user.email)
      if(index === -1){
        newPlayersAvailable.push({ email: current_user.email, nickname: current_user.nickname })
      }
      setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })
    }


  });

  socket.off('userUnAvailable')
  socket.on("userUnAvailable", function (userInfo) {

    console.log(CurrentUser.email, "got userUnAvailable", "userInfo:", userInfo);

    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));
    const index = (newPlayersAvailable).findIndex(user => !isUndefined(user) && user.email === userInfo)
    console.log(CurrentUser.email, "got index", "-->", index);
    var current_user = newPlayersAvailable[index]
    console.log(CurrentUser.email, "got current user", "-->", current_user);
    if(index === -1){
      InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
   }
   else{
    newPlayersAvailable.splice(index, 1)
    var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersUnAvailable));
    newPlayersUnAvailable.push(current_user)
    console.log(CurrentUser.email, "got current players-->", newPlayersAvailable, "un-->", newPlayersUnAvailable);
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })
   }

  });


  socket.off('userAccept')

  socket.on("userAccept", function (userInfo) {
    /*
       userInfo: {email: ..., nickName:...}
    */
    console.log("sending props: ", CurrentUser, CurrentRoom)

    history.push({
      pathname: '/TheGame',
      opponentId: userInfo.senderId,
      user: CurrentUser,
      room: CurrentRoom,
      turn: false,
      opponentName: userInfo.nickname
    })

  });
  socket.off("CancelInvitation");
  socket.on("CancelInvitation", function (userInfo) {
    /*
       userInfo: {email: ..., nickName:...}
    */
    setGotInvitationWindow(false);
  });


  function onAccept(props) {

    // Accept 
    socket.emit('deliverMessage', {
      message: 'userAccept',
      args: { nickname: CurrentUser.nickName },
      receiverId: SenderInfoID,
    })

    console.log("sending props: ", CurrentUser, CurrentRoom)
    history.push({
      pathname: '/TheGame',
      opponentId: SenderInfoID,
      user: CurrentUser,
      room: CurrentRoom,
      turn: true,
      opponentName: props
    })
  }

  const onDecline = () => {

    // Decline 
    socket.emit('deliverMessage', {
      message: 'userDecline',
      args: {},
      receiverId: SenderInfoID,
    })
    setGotInvitationWindow(false);
  }
  socket.off('InvitedToGameByUser')
  socket.on("InvitedToGameByUser", function (args) {
    setSenderInfoID(args.senderId);
    setSenderInfoName(args.senderName);
    setGotInvitationWindow(true);
  })

  const leaveRoom = () => {


    fetch(server + '/leaveRoom/' + CurrentRoom.room_id, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
    }).then((response) => {
      if (response.status !== okStatus) {
        reject(response.status)
      } else {
        return new Promise(function (resolve, reject) {
          resolve(response.json());
        })
      }
    }).then(fail_status => {
      console.log("failed. status: ", fail_status)
    })
    history.push("/LoginScreen/Home"); // moves to home page
    unlisten();

  };


  function PrintAnswerPlayerDialog(props) {

    const { WindowOpen, setWindowOpen, onAccept, onDecline, SenderInfoName } = props;
    console.log("name -->", SenderInfoName);

    return (
      <Dialog id="receivedInvitationPopUp" open={WindowOpen} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title"> {SenderInfoName} invited you to play </DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* 
      <Grid container justify="center">
      <InvitePlayerWaitingImage/>
      </Grid> */}

        </DialogActions>

        <Grid container justify="center" alignItems="center">
          <Grid container justify="center">
            <Button id="acceptBTN" onClick={() => onAccept(SenderInfoName)} color="primary">
              Accept
        </Button>
          </Grid>

          <Grid container justify="center">
            <Button id="declineBTN" onClick={onDecline} color="primary">
              Decline
        </Button>
          </Grid>
        </Grid>

      </Dialog>

    );
  }

  var img = require('../defaultAvatar.png')
  if (CurrentUser.imageData)
    img = CurrentUser.imageData.replace(/ /g,"+")

  return (
    <div id="joinGamePage">

      <PrintAnswerPlayerDialog WindowOpen={GotInvitationWindow} setWindowOpen={setGotInvitationWindow} onAccept={onAccept} onDecline={onDecline} SenderInfoName={SenderInfoName} />
      <Grid spacing={1} container>

        <Grid spacing={1} item xs={12}>
          <div style={{ float: 'right', marginRight: 10, marginTop: 10, }}>
            <Button id="leaveRoomBTN" variant="contained" color="primary" onClick={leaveRoom} className={classes.button}>
              Leave the room
      </Button>
          </div>
        </Grid>
        <Grid spacing={1} item xs={12}>
          <div style={{ float: 'right', marginRight: 10, marginTop: 10, }}>
      <Button id="scoreTableBTN" variant="contained" color="primary" className={classes.button}
              onClick={() => {
                history.push({
                pathname: '/ScoreTable',
                  roomId: CurrentRoom.room_id,
                })
              }}
            >
          SCORE TABLE
      </Button>
          </div>
        </Grid>

        <Grid spacing={1} item xs={12} justify="center">
            <img src={`${img}`} width="120" height='120'  border-style='none' />
        </Grid>

        <Grid item spacing={1} xs={12} justify="center" container>
          <div style={{ textAlign: 'center' }}>
            <Typography id="roomNameHeader" variant="h3" className={classes.title}>
              Room Name:
      {CurrentRoom.room_name}
            </Typography>
          </div>
        </Grid>


        <Grid item spacing={1} xs={12} justify="center" container>
          <div style={{ textAlign: 'center' }}>
            <Typography id="roomNumberHeader" variant="h4" className={classes.roomNumber}>
              Room Number:
     {CurrentRoom.room_id}
            </Typography>
          </div>
        </Grid>


        <Grid item spacing={1} xs={12} justify="center" container>
          <div style={{ textAlign: 'center' }}>
            <Typography id="userNameHeader" justify="center" variant="h5" className={classes.userTitle}>
              User Name:
      {CurrentUser.nickName}
            </Typography>
          </div>
        </Grid>
      </Grid>

      {/* 
      <Grid container spacing={3} justify="center">
        <HomepageImage />
      </Grid> */}


      {/* ******************************************************************************************** */}

      {/* <Grid container spacing={3} justify="center"> */}
      <div component="form" className={fixedHeightPaper}>
        <Grid container>
          <Grid item xs={12}>
            <Typography component="h6" variant="h5">
              Enter a user's name and start to play!
             </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              className={classes.input}
              placeholder="Enter a user's name"
              fullWidth
              variant="outlined"
              helperText={helperText}
              id="nickname"
              name="nickname"
              autoComplete="nickname"
              onKeyPress={(ev) => {
                // if(ev.key !== "Enter"){
                //    setPlayersList({ PlayersAvailable: PlayersListOld, PlayersUnAvailable: PlayersList.PlayersUnAvailable })  
                // }

                if (ev.key === 'Enter') {
                  handleClickSearch(inputName);
                //  return (<GamesList user={inputName}/>);
                }
              }
              }
              onChange={(event) => {
                setInputName(event.target.value);
                console.log("namee --->", inputName);
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton /*type="submit"*/ className={classes.iconButton} onClick={()=>handleClickSearch(inputName)} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Grid>
        </Grid>

      </div>

      {/* </Grid> */}


      {/* ******************************************************************************************** */}

      <PlayerListAvailable type={"Available"} PlayersAvailable={PlayersList.PlayersAvailable} CurrentUser={CurrentUser} />

      <PlayerListUnAvailable type={"Unavailable"} PlayersUnAvailable={PlayersList.PlayersUnAvailable} CurrentUser={CurrentUser} />


    </div>

  );

  function handleClickSearch(name){
    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));
    const index = (newPlayersAvailable).findIndex(user => user.nickname === name)
    if(index < 0)
      return;
    var current_user = newPlayersAvailable[index]
    if(current_user === undefined)
      return;

    var OldPlayersAvailable = JSON.parse(JSON.stringify(newPlayersAvailable));
    setPlayersListOld(OldPlayersAvailable);

    newPlayersAvailable = []
    newPlayersAvailable.push(current_user)
    var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersUnAvailable));
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })  
  }

  function InitTheRoom(props) {
    fetch(server + '/userList/' + props, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
    }).then((response) => {
      if (response.status !== okStatus) {
        reject(response.status)
      } else {
        return new Promise(function (resolve, reject) {
          resolve(response.json());
        })
      }
    }).then(data => {
      if (PlayersList.PlayersAvailable.length === 0 && data.PlayersAvailable !== undefined &&
        PlayersList.PlayersUnAvailable.length === 0 && data.PlayersUnAvailable !== undefined) {

        console.log('information that got from the server --- init the room --->', data.PlayersAvailable, data.PlayersUnAvailable);
        console.log('reading users available from data from server 1 ', data.PlayersAvailable);
        var newPlayersAvailable = JSON.parse(JSON.stringify(data.PlayersAvailable));
        console.log('reading users available from data from server 2 ', newPlayersAvailable);
        const index = (newPlayersAvailable).findIndex(user => user.email === CurrentUser.email)
        if(index > 0){
        console.log('reading users available from data from server 3 - index : ', index);
        newPlayersAvailable.splice(index, 1)
        console.log('reading users available from DB. newPlayersAvailable 4', newPlayersAvailable);
        }
        var newPlayersUnAvailable = JSON.parse(JSON.stringify(data.PlayersUnAvailable));
        setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })
        setPlayersListOld(newPlayersAvailable)
        setRoomUpdated(true);
      }
    }, fail_status => {
      console.log("failed. status: ", fail_status)
    })
  }

}
// ------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

// function HomepageImage() {
//   // const url = 'https://6sense.com/wp-content/uploads/2018/10/2-truths_Canva-011.png';
//   // const url = 'https://3.bp.blogspot.com/-dPiQYG83TVM/Tom3QSzuYpI/AAAAAAAACcM/3qlVVHdjtT4/s1600/Truth_or_Lie_.png';
//   const url = 'https://steemitimages.com/p/D5zH9SyxCKd9GJ4T6rkBdeqZw1coQAaQyCUzUF4FozBvW77pHd44QbfXeeya4Ah28LcdgWFSabaBmuZJgxUXrgCTAr69vWz41v4bEikrEuR2G48JcWt62S4JH37qmY3Vi9qfie?format=match&mode=fit';
//   return (
//     <img src={url} style={{ width: 450 }} alt='true or lie' />
//   );
// }


function InvitePlayerWaitingImage() {
  const url = 'https://ak1.picdn.net/shutterstock/videos/23800711/thumb/1.jpg';
  return (
    <img src={url} style={{ width: 250 }} alt='Waiting' />
  );
}

////////////////////-------------------- filter button --------------------- ///////////////////////////////////////

const useStylesButtonField = makeStyles(theme => ({
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

export function BasicTextFields() {
  const classes = useStylesButtonField();

  return (
    <form className={classes.container} noValidate autoComplete="off">
      <div>
        <TextField
          id="outlined-basic"
          className={classes.textField}
          label="Search for a player"
          margin="normal"
          variant="outlined"
        />
      </div>
    </form>
  );
}

// ------------------ LIST OF PLAYERS IN THE ROOM ------------------ //

const columnsForUnAvailable = [
  { id: 'name', label: 'Unavailable players', minWidth: 170, align: 'center' },
];

const columnsForAvailable = [
  { id: 'name', label: 'Available players', minWidth: 170, align: 'center' },
];

function createData(name) {
  return { name };
}


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: 440,
    overflow: 'auto',
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
  paper: {
    // padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    marginBottom: 10,
  },
  fixedHeight: {
  },
});

// ------------------------------------------------------------------------------------- /

export function PlayerListUnAvailable(props) {


  // socket.on("userDecline", function(userInfo) {
  //   /*
  //      userInfo: {email: ..., nickName:...}
  //   */
  //  setInvitePlayerWindowOpen(false);

  // });

  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const { PlayersUnAvailable, CurrentUser } = props;

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columnsForUnAvailable.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>

            {PlayersUnAvailable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              if (isUndefined(row) || row.email === CurrentUser.email)
              return (<div />);
              console.log("rowww:", row)
              if(row === undefined){
                return;
              }

              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.email}>
                  {columnsForUnAvailable.map(column => {

                    const value = row.nickname;
                    
                    const firstLetter = value.substring(0, 1)

                    return (
                      <TableCell key={row.email} align={column.align}>

                        <Grid container spacing={3}>

                          <Grid container justify="center" alignItems="center">

                            <Grid item xs={5} >
                              <Grid container justify="center" alignItems="center">
                                <Grid item xs={1}>

                                  <Avatar>
                                    {firstLetter}
                                  </Avatar>

                                </Grid>
                                <Grid item xs={1}>

                                  {column.format && typeof value === 'number' ? column.format(value) : value}
                                </Grid>
                              </Grid>

                            </Grid>

                            <Grid item xs={1}>
                              <ChatButton id={row.nickname + props.type + "ChatBTN"} email={row.email} />
                            </Grid>
                          </Grid>

                        </Grid>

                        {/* -------------------------------------------------- */}

                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={PlayersUnAvailable.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

// ----------------------------------------------------------------------------------------------------------------------- //


export function PlayerListAvailable(props) {

const { PlayersAvailable, CurrentUser } = props;


  socket.off('userDecline')
  socket.on("userDecline", function (userInfo) {
    /*
       userInfo: {email: ..., nickName:...}
    */
    setInvitePlayerWindowOpen(false);

  });


  function PrintInvitePlayerDialog(props) {

    const { InvitePlayerWindowOpen, setInvitePlayerWindowOpen, userThatInvited } = props;

    const onCloseWindow = () => {
      socket.emit('deliverMessage', {
        message: 'CancelInvitation',
        args: {},
        receiverId: userThatInvited,
      })
      setInvitePlayerWindowOpen(false);
    }

    return (
      <Dialog id="waitingForResponsePopUp" open={InvitePlayerWindowOpen} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Waiting for other player's response</DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>

          <Grid container justify="center">
            <DisplayLoadingGameInvitation />
          </Grid>

        </DialogActions>

        <Grid container justify="center">
          <Button id="cancelBTN" onClick={onCloseWindow} color="primary">
            Cancel the invitation
          </Button>
        </Grid>

      </Dialog>

    );
  }


  const [InvitePlayerWindowOpen, setInvitePlayerWindowOpen] = React.useState(false);

  const handleClickInvitePlayer = (userThatGotInvitedID, currentUserName) => {
    console.log("props name of user -- >", currentUserName);
    socket.emit('deliverMessage', {
      message: 'InvitedToGameByUser',
      args: { senderName: currentUserName },
      receiverId: userThatGotInvitedID,
    })
    setInvitePlayerWindowOpen(true);
  };

  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  console.log("Current user is --- >", CurrentUser);


  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columnsForAvailable.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {console.log(PlayersAvailable)}
            {PlayersAvailable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              if (isUndefined(row) || row.email === CurrentUser.email)
                return (<div />);
              {/* <Avatar src = {firstLetter}>
                </Avatar> */}
                // if(row === undefined || row.nickname === undefined){
                //   return;
                // }

              return (

                <TableRow hover role="checkbox" tabIndex={-1} key={row.email}>
                  {columnsForAvailable.map(column => {
                    console.log('row: ', row)
                    const value = row.nickname;
                    const firstLetter = value.substring(0, 1)

                    return (
                      <TableCell key={row.email} align={column.align}>

                        <Grid container spacing={1}>

                          <Grid container justify="center" alignItems="center">

                            <Grid item xs={5} >
                              <Grid container justify="center" alignItems="center">
                                <Grid item xs={1}>

                                  <Avatar>
                                    {firstLetter}
                                  </Avatar>

                                </Grid>
                                <Grid item xs={1}>

                                  {column.format && typeof value === 'number' ? column.format(value) : value}
                                </Grid>
                              </Grid>

                            </Grid>

                            <Grid item xs={2}>
                              <Button id={row.nickname + "InviteBTN"} variant="contained" color="primary" fullWidth onClick={() => {handleClickInvitePlayer(row.email, CurrentUser.nickName) }} className={classes.button}>
                                Invite to Game
                    </Button>
                            </Grid>

                            <Grid item xs={1}>
                              <ChatButton id={row.nickname + props.type + "ChatBTN"} email={row.email} />
                            </Grid>
                          </Grid>


                          <PrintInvitePlayerDialog
                            InvitePlayerWindowOpen={InvitePlayerWindowOpen}
                            setInvitePlayerWindowOpen={setInvitePlayerWindowOpen}
                            userThatInvited={row.email}
                          />
                        </Grid>

                        {/* -------------------------------------------------- */}

                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={PlayersAvailable.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}


export function DisplayLoadingGame() {
  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>

      <ReactLoading type={"bars"} color={"#000"} height={667} width={375} />
    </div>
  );
}




export function DisplayLoadingGameInvitation() {
  return (
    <div
      style={{
        // position: 'absolute', left: '50%', top: '50%',
        //   transform: 'translate(-50%, -50%)'
      }}>

      <ReactLoading type={"bars"} color={"#000"} height={200} width={200} />
    </div>
  );
}





