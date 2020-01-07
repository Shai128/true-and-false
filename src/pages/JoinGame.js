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
import { createBrowserHistory } from 'history'
import { ChatButton } from './../PagesUtils.js';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import { getUserFromProps, getCurrentUserFromSession } from './../user.js';
import { PrintChats, DisplayLoading } from './../PagesUtils.js'
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
  const [CurrentRoom, setCurrentRoom] = useState(roomObject);
  const [UpdatingRoom, setUpdatingRoom] = useState(false);
  const [CurrentUser, setCurrentUser] = useState(getUserFromProps(props));
  const [isUpdatedData, setIsUpdatedData] = useState(false);

  getCurrentUserFromSession(CurrentUser, setCurrentUser, (user) => { console.log('got user from session: ', user); setCurrentRoom(user.roomObject); setIsUpdatedData(true) }, () => { });

  const [roomUpdated, setRoomUpdated] = useState(false);
  const [PlayersList, setPlayersList] = useState({
    PlayersAvailable: [],
    PlayersUnAvailable: []
  });

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
      if (site === 'JoinGame') {
        socket.emit('changeUserAvailability', {
          newAvailability: userStates.AVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
        })
      }
      else if (site !== 'JoinGame') {
        socket.emit('changeUserAvailability', {
          newAvailability: userStates.UNAVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
        })
      }
    });
    setHistoryListenDefined(true);

  }



  if (!isUpdatedData) {
    return (<DisplayLoading />);
  }
  if (!roomUpdated && isUpdatedData && !UpdatingRoom) {
    setUpdatingRoom(true)
    InitTheRoom(CurrentRoom.room_id, setRoomUpdated);
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
    newPlayersAvailable.push({ email: userInfo.email, nickname: userInfo.nickName })
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
    newPlayersAvailable.splice(index, 1)
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: PlayersList.PlayersUnAvailable })


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


    var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersUnAvailable));
    const index = (newPlayersUnAvailable).findIndex(user => user.email === userInfo)
    var current_user = newPlayersUnAvailable[index]
    newPlayersUnAvailable.splice(index, 1)
    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));
    newPlayersAvailable.push(current_user)
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })


  });

  socket.off('userUnAvailable')
  socket.on("userUnAvailable", function (userInfo) {

    console.log(CurrentUser.email, "got userUnAvailable", "userInfo:", userInfo);

    var newPlayersAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersAvailable));
    const index = (newPlayersAvailable).findIndex(user => user.email === userInfo)
    console.log(CurrentUser.email, "got index", "-->", index);
    var current_user = newPlayersAvailable[index]
    console.log(CurrentUser.email, "got current user", "-->", current_user);
    newPlayersAvailable.splice(index, 1)
    var newPlayersUnAvailable = JSON.parse(JSON.stringify(PlayersList.PlayersUnAvailable));
    newPlayersUnAvailable.push(current_user)
    console.log(CurrentUser.email, "got current players-->", newPlayersAvailable, "un-->", newPlayersUnAvailable);
    setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })

  });


  socket.off('userAccept')

  socket.on("userAccept", function (userInfo) {
    /*
       userInfo: {email: ..., nickName:...}
    */
    console.log("sending props: ", CurrentUser, CurrentRoom)

    // socket.emit('changeUserAvailability', {
    //   newAvailability: userStates.UNAVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
    // })

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

    // socket.emit('changeUserAvailability', {
    //   newAvailability: userStates.UNAVAILABLE, userId: CurrentUser.email, roomId: CurrentRoom.room_id
    // })

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

  const handleClickSearch = (event) => {
    setHelperText('');
    // var currentUserFound = (PlayersAvailable.map(User => (User.nickname == event)))[0];
    // handleClickInvitePlayer(currentUserFound.email,currentUserFound.nickname)
    // if(!validEmail(inputName)){
    //     setHelperText('Please provide a valid email');
    //     return;
    // }
    // else
    // history.push({
    //     pathname: '/LoginScreen/ChatRoom/'+inputName,
    //     user: user,
    //     })
  }

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
      <Grid spacing={1} item xs = {12}>
      <div style={{ float: 'right', marginRight: 10, marginTop: 10, }}>
      <Button id="pointsTableBTN" variant="contained" color="primary" className={classes.button}
        onClick={()=>{history.push({
          pathname: '/PointsTable',
          roomId: CurrentRoom.room_id,
        })}}
        >
          POINTS TABLE
      </Button>
      </div>      
      </Grid>

        <Grid item spacing={1} xs={12} justify="center">
          <div style={{ textAlign: 'center' }}>
            <Typography id="roomNameHeader" variant="h3" className={classes.title}>
              Room Name:
      {CurrentRoom.room_name}
            </Typography>
          </div>
        </Grid>


        <Grid item spacing={1} xs={12} justify="center">
          <div style={{ textAlign: 'center' }}>
            <Typography id="roomNumberHeader" variant="h4" className={classes.roomNumber}>
              Room Number:
     {CurrentRoom.room_id}
            </Typography>
          </div>
        </Grid>


        <Grid item spacing={1} xs={12} justify="center">
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
            <Typography component="h8" variant="h5">
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
                if (ev.key === 'Enter') {
                  handleClickSearch(ev);
                }
              }
              }
              onChange={(event) => {
                setInputName(event.target.value);
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton /*type="submit"*/ className={classes.iconButton} onClick={handleClickSearch} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Grid>
        </Grid>

      </div>

      {/* </Grid> */}


      {/* ******************************************************************************************** */}

      <PlayerListAvailable type={"Available"} PlayersAvailable={PlayersList.PlayersAvailable} CurrentUser={CurrentUser} />

      <PlayerListUnAvailable type={"Unavailable"} PlayersUnAvailable={PlayersList.PlayersUnAvailable} />


    </div>

  );

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

        console.log('reading users available from data from server 1 ', data.PlayersAvailable);
        var newPlayersAvailable = JSON.parse(JSON.stringify(data.PlayersAvailable));
        console.log('reading users available from data from server 2 ', newPlayersAvailable);
        const index = (newPlayersAvailable).findIndex(user => user.email === CurrentUser.email)
        console.log('reading users available from data from server 3 - index : ', index);
        newPlayersAvailable.splice(index, 1)
        console.log('reading users available from DB. newPlayersAvailable 4', newPlayersAvailable);
        // setPlayersAvailable(newPlayersAvailable)
        var newPlayersUnAvailable = JSON.parse(JSON.stringify(data.PlayersUnAvailable));
        //   setPlayersUnAvailable(newPlayersUnAvailable);
        setPlayersList({ PlayersAvailable: newPlayersAvailable, PlayersUnAvailable: newPlayersUnAvailable })
        setRoomUpdated(true);
      }
    }, fail_status => {
      console.log("failed. status: ", fail_status)
    })
  }

}
// ------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

function HomepageImage() {
  // const url = 'https://6sense.com/wp-content/uploads/2018/10/2-truths_Canva-011.png';
  // const url = 'https://3.bp.blogspot.com/-dPiQYG83TVM/Tom3QSzuYpI/AAAAAAAACcM/3qlVVHdjtT4/s1600/Truth_or_Lie_.png';
  const url = 'https://steemitimages.com/p/D5zH9SyxCKd9GJ4T6rkBdeqZw1coQAaQyCUzUF4FozBvW77pHd44QbfXeeya4Ah28LcdgWFSabaBmuZJgxUXrgCTAr69vWz41v4bEikrEuR2G48JcWt62S4JH37qmY3Vi9qfie?format=match&mode=fit';
  return (
    <img src={url} style={{ width: 450 }} alt='true or lie' />
  );
}


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

const avatarPicAvailable = [
  "data:image/jpeg;base64,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",
  'https://6sense.com/wp-content/uploads/2018/10/2-truths_Canva-011.png',

];

const avatarPic = [
  'N',
  'N',
  'S',
];

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

  const { PlayersUnAvailable } = props;

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

              {/* <Avatar src = {firstLetter}>
                  </Avatar> */}

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
            <InvitePlayerWaitingImage />
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
    // TODO: also makes changeUserAvailability request to server 
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

  const { PlayersAvailable, CurrentUser } = props;
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
                              <Button id={row.nickname + "InviteBTN"} variant="contained" color="primary" fullWidth onClick={() => { handleClickInvitePlayer(row.email, CurrentUser.nickName) }} className={classes.button}>
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



