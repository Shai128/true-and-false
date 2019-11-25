const express  = require("express") //express contains functions including app, which is the server
const {
  createUser,
  findUser,
  updateUser,
  findUserByField
} = require("../db/user") //imports create user
const {
  getRandomSentence,
  standardErrorHandling,
  getRandomSentenceForDuel,
  getIdentifierFromSession
} = require("./server_util")

const mongoose = require("../db/config")
var session = require("express-session");
const MongoStore = require("connect-mongo")(session);
session = require("express-session")({
  secret: "a very good secret",
  resave: false, // might need this to be true
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    url: "mongodb://localhost:27017/TrueAndFalse"
  })
})

const app = express()
const port = 8000
const bodyParser = require("body-parser")
const socket = require('socket.io')
// Session stuff:
const sharedsession = require("express-socket.io-session");
const cookieParser = require("cookie-parser")
app.use(cookieParser())
app.use(session);

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", 'Content-Type');
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

/*
const {
  findGame,
} = require("../db/game")*/

function findGame(game, success, failure) {
  success({
    all_sentences: ["tp11", "tp12", "tp13", "lp11", "lp12", "lp13", "tp21", "tp22", "tp23", "lp21", "lp22", "lp23"],
    players: {
      p1: {
        truths: ["tp11", "tp12", "tp13"],
        seen: ["tp22", "lp22", "tp11", "tp12", "tp13"]
      },
      p2: {
        truths: ["tp21", "tp22", "tp23"],
        seen: ["tp21", "tp22", "tp23"]
      }
    }
  })
}

app.get('/', (req, res) => res.send("request for / recieved"))

app.get('/welcome',(req,res)=> res.send(`hello ${req.body.shalom.bla}`))

app.post('/user',(req,res)=> {
    let data = JSON.parse(req.body.json)
    console.log('trying to create user with data: ' + JSON.stringify(data));
    createUser(data,
    ()=>{res.status(200).send("success")},(err)=>{standardErrorHandling(res, err)});
})

/**
 * a simple login function
 * TODO: should create a session and save it on the database
 */
app.get('/user/:email/:password', (req, res) => {
  console.log('get user');

  console.log(req.session.email) // just for debug
  if (! req.session.myInt) { req.session.myInt = 1}
  console.log(req.session.myInt ++)

  let data = {
    email: req.params.email,
    password: req.params.password
  }

  findUser(data,
    (found_user)=>{
      if (found_user.password === data.password) { // TODO: should later change to hash(password)
        req.session.email = data.email
        console.log("successfuly returned user: " + found_user.get('email'));
        res.status(200).send("successfuly logged in");
      } else {
        console.log("the password: " 
          + data.password 
          + " does not match for email: " 
          + data.email);
        standardErrorHandling(res, "password does not match");
      }
    },(err)=>{standardErrorHandling(res, err)});
})

app.get('/randomSentence/:game/:subject/:receiver', (req, res) => {
  console.log('random sentence 2');

  findGame(
    req.params.game,
    (game_data) => getRandomSentenceForDuel(
      game_data,
      req.params.subject, 
      req.params.receiver, 
      (sentence_data) => res.send(JSON.stringify(sentence_data)), 
      (err) => standardErrorHandling(res, err))
    ,
    (err) => standardErrorHandling(res, err));
})

/**
 * Checks whether a user exists with field == value.
 * (For example, field can be 'username' or 'email')
 */
app.get('/userExists/:field/:value', (req, res) => {
  console.log('user exists');
  findUserByField(
    req.params.field, 
    req.params.value,
    (users) => {
      console.log('searched user with ' + req.params.field + ': ' + req.params.value + '. result: ' + (users.length !== 0))
      res.send(toString(users.length !== 0))
    },
    (err) => standardErrorHandling(res, err)
  );
})

/**
 * Universal function for updating any kind of information on existing user.
 */
app.post('/userupdate', (req, res) => {
  console.log('update user');
  let data = JSON.parse(req.body.json)
  updateUser(data,
    ()=>{
      console.log("succesfully updated user: " + data.username)
      res.send("success");
    }
    ,(err)=>{standardErrorHandling(res, err)});
})

/**
 * Returns the session id (currently email) to the frontend
 */
app.get('/getSessionIdentifier', (req, res) => {
  getIdentifierFromSession(
    req,
    (id) => {res.status(200).send(id)},
    () => {standardErrorHandling(res, "session does not exist")}
  )
})

/**
 * Returns a user in the database (entire object),
 * Or an error if identifier id does not specify a valid user
 */
app.get('/getUserByIdentifier/:id', (req, res) => {
  findUser(
    {email: req.params.id},
    (user_data) => {res.status(200).send(JSON.stringify(user_data))},
    (err) => standardErrorHandling(res, err))
})

/**
 * Returns an entire user object according to the session id.
 * this is getUserByIdentifier(getSessionIdentifier())
 */
app.get('/getUserFromSession', (req, res) => {
  getIdentifierFromSession(
    req,
    (id) => {
      res.redirect('/getUserByIdentifier/' + toString(id))
    },
    () => {standardErrorHandling(res, "session does not exist")}
  )
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server);
io.use(sharedsession(session));


var a = 0;
io.on('connection', function (socket) {
a++;
  console.log('tut bananim' + a)

  // socket.on("login", function(userdata) {
    
  //   console.log(userdata.user.username + " has logged in");
  //   console.log(socket.handshake.session.userdata);
  //   socket.handshake.session.userdata = userdata;
  //   socket.handshake.session.save();
  // });

  // socket.on("logout", function(userdata) {
  //   if (socket.handshake.session.userdata) {
  //     delete socket.handshake.session.userdata;
  //     socket.handshake.session.save();
  //   }
  // });

  socket.on('S_chat', function (data) {
    console.log(data.messageContent + " was written");
    console.log(socket.handshake.session.userdata);
    socket.handshake.session.userdata = data;
    socket.handshake.session.save();
    io.sockets.connected[data.user.socketID].emit('C_chat', data);
    io.sockets.connected[data.receiverUser.socketID].emit('C_chat', data);
  })


/*
  socket.on('S_openRoom', function (data) {
    //var roomArray = //todo- get roomArray from database
    var r;
    do {
      r = Math.floor(Math.random() * 1000) + 1;
    }
    while (roomArray[r]);
    roomArray[r] = 1;
    //todo- update roomArrayTo database
    var room = {
      roomID: r,
      roomName: data.roomName,
      users: [data.user]
    }
    //todo- add room to the database
    io.sockets.connected[data.user.socketID].emit('C_roomOpened', room.roomID)
  })*/

  // socket.on('S_joinRoom', function (data) {
  //   //var room = //todo- get room from database with data.roomID

  //   //if(couldnt find room){
  //   //  io.sockets.connected[data.user.socketID].emit('C_wrongRoomID');
  //   //}
  //   var isTaken = false;
  //   for (let user of room.users) {
  //     if (user.gameNickName == data.nickName) {
  //       io.sockets.connected[data.user.socketID].emit('C_nickNameTaken');
  //       isTaken = true;
  //       break
  //     }
  //   }

  //   if (isTaken == false) {


  //     for (let user of room.users) {
  //       io.sockets.connected[data.user.socketID].emit('C_someonejoinedRoom', data.user);
  //     }

  //     room.users.push(data.user);
  //     //todo- update database with updated room

  //     io.sockets.connected[data.user.socketID].emit('C_joinedRoom', room);


  //   }
  // });

  // socket.on('S_leaveRoom', function (data) {
  //   //handle when a player leaves a room
  //   io.sockets.connected[data.user.socketID].emit('C_chat', data);
  //   io.sockets.connected[data.receiverUser.socketID].emit('C_chat', data);
  // })






  //when a player clicks on another player to start a match.
  //data has sender, receiver, roomID
//   socket.on('S_invitePlayerForMatch', function (data) {
//     io.sockets.connected[data.receiver.socketID].emit('C_invitationToMatch', data);
//   })

//   //when a player responds to another player's match invitation.
//   //data has sender, receiver, roomID, accepted (boolean)
//   socket.on('S_matchInvitationResponse', function (data) {
//     if(data.accepted == true){
//       io.sockets.connected[data.receiver.socketID].emit('C_matchInvitationAccepted', data);
//     }
//     else{
//       io.sockets.connected[data.receiver.socketID].emit('C_matchInvitationRejected', data);
//     }
//   })


// var data = {
//   sender: user,
//   receiver: other_user,
//   roomid: roomid
// }
//   socket.emit('S_invitePlayerForChat', data);


// socket.on('C_invitationToChat', function (data){

// })


//   //when a player invites another player to chat.
//   //data has sender, receiver, roomID
//   socket.on('S_invitePlayerForChat', function (data) {
//     io.sockets.connected[data.receiver.socketID].emit('C_invitationToChat', data);
//   })

//   //when a player responds to another player's match invitation.
//   //data has sender, receiver, roomID, accepted (boolean)
//   socket.on('S_chatInvitationResponse', function (data) {
//     if(data.accepted == true){
//       io.sockets.connected[data.receiver.socketID].emit('C_chatInvitationAccepted', data);
//     }
//     else{
//       io.sockets.connected[data.receiver.socketID].emit('C_chatInvitationRejected', data);
//     }
//   })



//   //when 2 players agree to play a game
//   //data has player1, player2, roomID
//   socket.on('S_matchStart', function (data) {
//     for (let user of getRoomFromDatabase(data.roomID).users) {
//             io.sockets.connected[data.user.socketID].emit('C_matchStarted', data.user);
//     }
//   })


//   //when a player leaves during a match
//   //data has sender, receiver, roomID
//   socket.on('S_leaveMatch', function (data) {
//     io.sockets.connected[data.receiver.socketID].emit('C_opponentLeftMatch', data);
//   })
//  //when a player leaves during chat
//   //data has sender, receiver, roomID
//   socket.on('S_leaveChat', function (data) {
//     io.sockets.connected[data.receiver.socketID].emit('C_opponentLeftChat', data);
//   })

  socket.on('disconnect', function () {
    console.log("pizza")
  })
})