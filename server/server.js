const express  = require("express") //express contains functions including app, which is the server
const {
  createUser,
  findUser,
  updateUser,
  findUserByField
} = require("../db/user") // imports all user functions

const {
  createRoom,
  addUserToRoom,
  findRoomById,
  getAvailableUsers,
  getUnAvailableUsers,
  removeUserFromRoom,
  getRoomSize,
  deleteRoomById
} = require("../db/rooms") //imports all room functions

const {
  getRandomSentence,
  standardErrorHandling,
  getRandomSentenceForDuel,
  getIdentifierFromSession,
  logDiv,
  getUserInfoFromSession,
  convertUserListFormat
} = require("./server_util")

const mongoose = require("../db/config")
var session = require("express-session");
const MongoStore = require("connect-mongo")(session);
session = require("express-session")({
  secret: "a very good secret",
  resave: false, // might need this to be true
  saveUninitialized: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", 'Content-Type');
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", "true");

  next();
});

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

/**
 * Registers a new user, according to data passed in requrest body.
 */
app.post('/user', serverCreateUser)

/**
 * Logs in to user according to email and password credentials.
 * Adds user info to session after logging in.
 */
app.get('/user/:email/:password', serverLoginUser)

/**
 * Randomizes a sentence for a duel between two users.
 */
app.get('/randomSentence/:game/:subject/:receiver', serverRandomSentence)
/**
 * Checks whether a user exists with field == value.
 * (For example, field can be 'username' or 'email')
 */
app.get('/userExists/:field/:value', serverUserExists)

/**
 * Universal function for updating any kind of information on existing user.
 */
app.post('/userupdate/:id', serverUserUpdate)

app.get('/logout', (req, res) => {
  getUserInfoFromSession(
    req,
    (userInfo) => {
      console.log("user:", userInfo.email, "is logging out")
      req.session.userInfo = {}
      res.status(200).send("successfuly logged out")
    },
    (err) => standardErrorHandling(res, err)
  )
})

function serverCreateUser(req, res) {
  let data = JSON.parse(req.body.json)
  console.log('trying to create user with data: ' + JSON.stringify(data));
  createUser(data,
  ()=>{res.status(200).send("success")},(err)=>{standardErrorHandling(res, err)});
}

function serverLoginUser(req, res) {
  logDiv('user login')

  let data = {
    email: req.params.email,
    password: req.params.password
  }

  findUser(data,
    (found_user)=>{
      if (found_user.password === data.password) { // TODO: should later change to hash(password)
        req.session.userInfo = {
          email: data["email"],
          nickName: data["nickName"]
        }
        console.log('saved email:', data['email'])
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
}


function serverRandomSentence(req, res) {
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
}

function serverUserExists(req, res) {
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
}

function serverUserUpdate(req, res) {
  console.log('update user');
  let data = JSON.parse(req.body.json)
  updateUser(req.params.id, data,
    ()=>{
      console.log("succesfully updated user: " + data.username)
      res.status(200).send("success");
    }
    ,(err)=>{standardErrorHandling(res, err)});
}

/**
 * Returns the session id (currently email) to the frontend
 */
app.get('/getSessionIdentifier', (req, res) => {
  getIdentifierFromSession(
    req,
    (id) => {res.status(200).send(id)},
    (err) => {standardErrorHandling(res, err)}
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
      findUser(
        {email: id},
        (user_data) => {res.status(200).send(JSON.stringify(user_data))},
        (err) => standardErrorHandling(res, err))
    },
    (err) => {standardErrorHandling(res, err)}
  )
})

/**
 * Creates a new room with a given name.
 * On success, returns the unique "random" id of the new room.
 */
app.get('/createRoom/:newRoomName',(req,res)=> {
  var newRoomName = req.params.newRoomName;
  console.log('trying to create room with name: ' + newRoomName);
  createRoom(
    newRoomName,
    (newRoomId) => {
      console.log("new room id", newRoomId);
      serverAddUserToRoom(req, res, newRoomId)
    },
    (err) => standardErrorHandling(res, err)
  )
})
 
/**
 * Adds a given user to a given room.
 * User id is inferred from the session.
 */
app.get('/joinRoom/:roomId', (req, res) => {
  serverAddUserToRoom(req, res, req.params.roomId)
})

function  serverAddUserToRoom(req, res, roomId) {
  console.log("adding user to room:", roomId)
  getUserInfoFromSession(
    req,
    (userInfo) => {
      console.log("user info", userInfo);
      addUserToRoom(
        roomId,
        userInfo.email, 
        (succ) => {
          console.log("sending the status now")
          console.log("created room with id", roomId)
          res.status(200).send({ID: roomId});
          console.log("sent")
          // add the user's socket to the room
          var userSocket = findSocketByUserId(userInfo.email)
          if (userSocket !== undefined) {userSocket.join(roomId.toString())}
          // notify all other users in the room
          io.to(roomId).emit('userJoined', userInfo)
        },
        (err) => standardErrorHandling(res, err)
      )
    },
    (err) => {standardErrorHandling(res, err)}
  )
} 

/**
 * Removes a user from a given room.
 * User id is inferred from the session.
 */
app.get('/leaveRoom/:roomId', (req, res) => {
  var roomId = req.params.roomId
  console.log("adding user to room:", roomId)
  getUserInfoFromSession(
    req,
    (userInfo) => {
      removeUserFromRoom(
        roomId,
        userInfo.email, 
        (succ) => {
          res.status(200).send(succ);
          // remove the user's socket from room
          var userSocket = findSocketByUserId(userInfo.email)
          if (userSocket !== undefined) {userSocket.leave(roomId.toString())}

          getRoomSize(
            roomId, 
            (size) => {
              if (size === 0) {
                deleteRoomById(roomId, () => {}, (err) => console.log(err))
              } else {
                // notify users in room about leaving
                io.to(roomId).emit('userJoined', userInfo)
              }
            },
            (err) => console.log("failed to delete room")
          )
        },
        (err) => standardErrorHandling(res, err)
      )
    },
    (err) => {standardErrorHandling(res, err)}
  )
})

/**
 * Returns an object containing the lists of available
 * and unavailable users in a given room.
 */
app.get('/userList/:roomId', (req, res) => {
  var roomId = req.params.roomId
  console.log("getting user list of room:", roomId);
  getAvailableUsers(
    roomId,
    (availableUsers) => {
      getUnAvailableUsers(
        roomId,
        (unavailableUsers) => {
          findRoomById(
            roomId, 
            (roomObject) => {
              res.status(200).send(JSON.stringify({
                PlayersAvailable: convertUserListFormat(availableUsers),
                PlayersUnAvailable: convertUserListFormat(unavailableUsers),
                RoomName: roomObject.room_name,
                RoomId: roomObject.room_id
              }))
            }, 
            (err) => standardErrorHandling(res, err)
          )
        },
        (err) => standardErrorHandling(res, err)
      )
    },
    (err) => standardErrorHandling(res, err)
  )
})

/**
 * socket io stuff from here on
 */

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server);
io.use(sharedsession(session, {
  autoSave: true
}));

function findSocketByUserId(userId) {
  for (let [socketId, socketObject] of Object.entries(io.sockets.sockets)) {
    if (socketObject.handshake.session.userInfo.userId === userId) {
      return socketObject;
    }
  }
  return undefined;
}

io.on('connection', function (socket) {
  logDiv("new connection")
  console.log('socket connection ' + socket.id)

  console.log("user_id that logged in: ", socket.request._query['user_id'])
  console.log("all sockets so far:", Object.keys(io.sockets.sockets))
  logDiv()

  socket.handshake.session.userInfo = {userId: socket.request._query['user_id']}

  // If the user is already in a room - subscribe to that room with his new socket
  findUser(
    {email: socket.handshake.session.userInfo.userId},
    (found_user) => {
      socket.join(toString(found_user.current_room))
    },
    (err) => console.log(err)
  )

  socket.on("login", function(userdata) {
    var userInfo = userdata.user;
    console.log(userInfo.nickName + " has logged in");
    console.log("full info:", userInfo)
   // socket.handshake.session.userInfo = userInfo;
    socket.handshake.session.save();
  });

  socket.on("logout", function(userdata) {
    if (socket.handshake.session.userInfo) {
      delete socket.handshake.session.userInfo;
      socket.handshake.session.save();
    }
  });

  socket.on('chat', function(data){
    console.log(data.messageContent + " was written");
    console.log(socket.handshake.session.userdata);
    socket.handshake.session.userdata = data;
    socket.handshake.session.save();
    
    let message = data;
    message.date = Date();
    console.log('Date.now(): ', Date.now());
    console.log('Date(): ', Date());

    saveMessageInDB(data.user.email, message);
    addMessageToRecentMessagesInDB(data.user.email, message);

    saveMessageInDB(data.receiverUserEmail, message);
    addMessageToRecentMessagesInDB(data.receiverUserEmail, message);

    io.sockets.emit(data.user.email+'_chat', data);
    io.sockets.emit(data.receiverUserEmail+'_chat', data);
    io.sockets.emit(data.receiverUserEmail+'_chat_notification', data);
    // io.sockets.connected[data.user.socketID].emit('C_chat', data);
    // io.sockets.connected[data.receiverUser.socketID].emit('C_chat', data);
  })

/**
 * adding the message to the specific chat list between the two users
 * @param {the user that we add the message to his document} userEmail 
 * @param {includes the message content, author, receiver, time} message 
 */
function saveMessageInDB(userEmail, message){


//todo: call db function to save it in the db
}

/**
 * adding the message to the recent messages list
 * @param {the user that we add the message to his document} userEmail 
 * @param {includes the message content, author, receiver, time} message 
 */
function addMessageToRecentMessagesInDB(userEmail, message){

}



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
    logDiv('new disconnect')
    console.log("disconnected " + socket.id)
    logDiv()
  })
})