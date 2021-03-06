const crypto = require("crypto-js");

const express = require("express") //express contains functions including app, which is the server
const {
  createUser,
  findUser,
  updateUser,
  findUserByField,
  updateLastActiveAt,
  addUnReadMessage,
  addMessegesByAddressee,
  resetUnReadMessage,
  removeUnReadMessagesFromCertainUserInDB,

} = require("../db/user") // imports all user functions
const { resetDatabase } = require("../db/general") // imports all generel databse menagement functions
const {
  createRoom,
  addUserToRoom,
  findRoomById,
  getAvailableUsers,
  getUnAvailableUsers,
  deleteUserByEmailInRoomByRoomID,
  getRoomSize,
  updateRoom,
  deleteRoomById,
  changeUserAvailability,
  findUserByEmailInRoomByRoomID,
  getAllSentencesArray
} = require("../db/rooms") //imports all room functions
const { isUndefined, statusCodes } = require('../src/Utils.js');
const {
  getRandomSentence,
  standardErrorHandling,
  getRandomSentenceForDuel,
  getIdentifierFromSession,
  logDiv,
  getUserInfoFromSession,
  convertUserListFormat,
} = require("./server_util")
var fs = require('fs')
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
//app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.header('origin')); // update to match the domain you will make the request from
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
function tryout() {
  resetDatabase(50, () => { console.log("successfuly reset database") }, (err) => console.log(err))
}
//tryout();
// uncomment this to reset server
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
      console.log("updates userInfo5: {}", req.session.userInfo)
      res.status(200).send("successfuly logged out")
    },
    (err) => standardErrorHandling(res, err)
  )
})

function serverCreateUser(req, res) {
  //var imgData = req.body.json.imageData
  let data = JSON.parse(req.body.json)
  //data.imageData = fs.readFileSync(req.file.imageData);
  //data.contentType = 'image/jpg'
  console.log('trying to create user with data: ' + JSON.stringify(data));
  createUser(data,
    () => { res.status(200).send("success") }, (err) => { standardErrorHandling(res, err) });
}

function serverLoginUser(req, res) {
  logDiv('user login')

  let data = {
    email: req.params.email,
    password: req.params.password
  }

  findUser(data,
    (found_user) => {
      let hashedPassword = crypto.PBKDF2(data.password, found_user.salt, { keySize: 512 / 32, iterations: found_user.iterations }).toString();

      if (found_user.password === hashedPassword) {
        //  console.log("data", data, "foundUser:", found_user)
        req.session.userInfo = {
          email: found_user["email"],
          nickName: found_user["nickName"]
        }
        console.log("updated userInfo1", req.session.userInfo)

        console.log('saved email:', data['email'])
        console.log("successfuly returned user: " + found_user.get('email'));
        res.status(200).send(JSON.stringify(found_user));
      } else {
        console.log("the password: "
          + hashedPassword
          + " does not match for email: "
          + data.email);
        standardErrorHandling(res, statusCodes.PASSWORD_MISMATCH);
      }
    }, (err) => { standardErrorHandling(res, err) });
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
  updateUser(req.params.id, null, data,
    () => {
      console.log("succesfully updated user: " + data.email)
      res.status(200).send("success");
    }
    , (err) => { standardErrorHandling(res, err) });
}

/**
 * Returns the session id (currently email) to the frontend
 */
app.get('/getSessionIdentifier', (req, res) => {
  getIdentifierFromSession(
    req,
    (id) => { res.status(200).send(id) },
    (err) => { standardErrorHandling(res, err) }
  )
})

/**
 * Returns a user in the database (entire object),
 * Or an error if identifier id does not specify a valid user
 */
app.get('/getUserByIdentifier/:id', (req, res) => {
  findUser(
    { email: req.params.id },
    (user_data) => { res.status(200).send(JSON.stringify(user_data)) },
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
      console.log('getUserFromSession id:', id);
      findUser(
        { email: id },
        (user_data) => { res.status(200).send(JSON.stringify(user_data)) },
        (err) => standardErrorHandling(res, err))
    },
    (err) => { standardErrorHandling(res, err) }
  )
})

/**
 * Creates a new room with a given name.
 * On success, returns the unique "random" id of the new room.
 */
app.get('/createRoom/:newRoomName', (req, res) => {
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

function serverAddUserToRoom(req, res, roomId) {
  console.log("adding user to room:", roomId)
  getUserInfoFromSession(
    req,
    (userInfo) => {
      console.log("user info", userInfo);
      findUserByEmailInRoomByRoomID(
        roomId,
        userInfo.email,
        (found_user_object) => {
          findRoomById(
            roomId,
            (room_object) => {
              console.log("user is already in room")
              var userSocket = findSocketByUserId(userInfo.email)
              // console.log("user socket", userSocket, "found of user:", userInfo.email)
              if (userSocket !== undefined) {
                userSocket.join(roomId.toString())
                console.log("added the user's", userInfo.email, "socket to room", roomId.toString())
              }
              res.status(200).send(JSON.stringify({
                // TODO: send only minimal data required by frontend to reduce latency
                userObject: found_user_object,
                roomObject: room_object
              }))
            },
            (err) => { standardErrorHandling(err) }
          )
        },
        (user_not_found_err) => {
          leaveCurrentRoom(
            {
              email: userInfo.email,
              nickname: userInfo.nickname
            },
            () => {
              addUserToRoom(
                roomId,
                userInfo.email,
                (roomAndUser) => {
                  console.log("sending the status now")
                  // console.log("created room with id", roomId)
                  console.log("added user", userInfo.email, "to room", roomId)
                  //  console.log("roomAndUserObject:", roomAndUser)
                  // TODO: send only minimal data required by frontend to reduce latency
                  res.status(200).send(JSON.stringify(roomAndUser));
                  console.log("sent")
                  // add the user's socket to the room
                  var userSocket = findSocketByUserId(userInfo.email)
                  // console.log("user socket", userSocket, "found of user:", userInfo.email)
                  if (userSocket !== undefined) {
                    userSocket.join(roomId.toString())
                    console.log("added the user's", userInfo.email, "socket to room", roomId.toString())
                  }
                  // notify all other users in the room
                  console.log("emitting a message to room", roomId, "about player join", userInfo)
                  io.in(roomId).clients((err, clients) => {
                    console.log("clients of room:", clients); // an array containing socket ids in 'room3'
                  });
                  io.to(roomId).emit('userJoined', userInfo)
                },
                (err) => standardErrorHandling(res, err)
              )
            },
            (err) => standardErrorHandling(res, err)
          );
        }
      )
    },
    (err) => { standardErrorHandling(res, err) }
  )
}

/**
 * Removes a user from a given room.
 * User id is inferred from the session. - DEPRECATED
 */
app.get('/leaveRoom/:roomId', (req, res) => {
  var roomId = req.params.roomId
  console.log("removing user from room room:", roomId)
  getUserInfoFromSession(
    req,
    (userInfo) => {
      leaveCurrentRoom(
        userInfo,
        (succ) => res.status(200).send(succ),
        (err) => standardErrorHandling(res, err)
      )
    },
    (err) => { standardErrorHandling(res, err) }
  )
})


/**
 * find the user's current room and leave it.
 */
function leaveCurrentRoom(userInfo, success, failure) {
  logDiv('leaveCurrentRoom')
  console.log("user:", userInfo.email, "is leaving it's current room");
  findUser(
    { email: userInfo.email },
    (userObject) => {
      const roomId = userObject.roomObject.room_id;
      console.log("the current room to leave:", roomId);
      if (roomId === -1) {
        success()
      } else {
        deleteUserByEmailInRoomByRoomID(
          roomId,
          userInfo.email,
          (succ) => {
            // remove the user's socket from room
            var userSocket = findSocketByUserId(userInfo.email)
            if (userSocket !== undefined) { userSocket.leave(roomId.toString()) }


            // notify users in room about leaving
            console.log("emitting a message to room", roomId, "about player leave", userInfo)
            io.to(roomId).emit('userLeft', userInfo)

            success("successfuly left the room")
          },
          (err) => failure(err)
        )
      }
    },
    (err) => failure(err)
  )
}

/**
 * returns the truths and lies of a given user (opponent) in a given room
 * return format is an object: 
 * {
 *  truths: [array of true sentences about the opponent].
 *  lies: [array of false sentences about the opponent].
 * }
 */
app.get('/userSentences/:opponentId/:roomId', (req, res) => {
  logDiv('userSentences')
  console.log("opponent:", req.params.opponentId, "room:", req.params.roomId)
  findUserByEmailInRoomByRoomID(
    req.params.roomId,
    req.params.opponentId,
    (userObject) => { // find the given user
      console.log('in userSentences found user: ', userObject);
      getAllSentencesArray(
        req.params.roomId,
        (allSentences) => { // find the global sentences array to extract lies
          var extracted_truths = userObject.true_sentences.map(x => x.value)
          console.log("user truths:", userObject.true_sentences, "global:", allSentences);
          var extracted_lies = allSentences.filter(s => !extracted_truths.includes(s))
          console.log("extracted lies:", extracted_lies)

          res.status(200).send(JSON.stringify({
            truths: extracted_truths,
            lies: extracted_lies,
            userObject: userObject
          }))
          logDiv()
        },
        (err) => standardErrorHandling(res, err)
      )
    },
    (err) => standardErrorHandling(res, err)
  )
})


/**
 * returns the mini-object that represents a given user in a given room.
 * contains already_seen_sentences and score.
 */
app.get('/getUserObjectInRoom/:roomId/:userId', (req, res) => {
  logDiv('getUserObjectInRoom')
  findUserByEmailInRoomByRoomID(
    req.params.roomId,
    req.params.userId,
    (userObject) => { // find the given user
      res.status(200).send(JSON.stringify(userObject))
    },
    (err) => standardErrorHandling(res, err)
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
              //console.log("Players available" ,availableUsers)
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

/** author: Shai
 * Resets the unReadMessages array
 */
app.post('/user/resetUnReadMessages/:email', (req, res) => { resetUnReadMessage(req.params.email, () => { }) })

/**
 * author: Shai
 * removes all unreadmessages that were written by otherUserEmail, in email document
 */
app.post('/user/resetUnReadMessagesFromCertainUser/:email/:otherUserEmail', (req, res) => {
  removeUnReadMessagesFromCertainUserInDB(req.params.email, req.params.otherUserEmail, () => { })
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
  logDiv("findSocketByUserId")
  for (let [socketId, socketObject] of Object.entries(io.sockets.sockets)) {
    //  console.log("socket:", socketId, "with obj:", JSON.stringify(socketObject.handshake.session.userInfo))
    if (socketObject.handshake.session.userInfo.email === userId) {
      logDiv();
      return socketObject;
    }
  }
  logDiv();
  return undefined;
}

io.on('connection', function (socket) {
  logDiv("new connection")
  console.log('socket connection ' + socket.id)

  console.log("user_id that logged in: ", socket.request._query['user_id'])
  console.log("all sockets so far:", Object.keys(io.sockets.sockets))
  logDiv()

  if (socket.handshake.session.userInfo === undefined) {
    socket.handshake.session.userInfo = {}
  }
  socket.handshake.session.userInfo.email = socket.request._query['user_id']
  socket.handshake.session.save();
  console.log("updated userInfo2 (socket)", socket.handshake.session.userInfo)

  // If the user is already in a room - subscribe to that room with his new socket
  findUser(
    { email: socket.handshake.session.userInfo.email },
    (found_user) => {
      socket.join(toString(found_user.current_room))
    },
    (err) => console.log(err)
  )

  socket.on("login", function (userInfo) {
    logDiv("socket login")
    console.log(userInfo.email + " has logged in");
    console.log("updated userInfo3 (socket):", userInfo)
    socket.handshake.session.userInfo = userInfo;
    socket.handshake.session.save();
    logDiv();
  });

  socket.on("logout", function (userInfo) {
    if (socket.handshake.session.userInfo) {
      delete socket.handshake.session.userInfo;
      socket.handshake.session.save();
    }
  });

  socket.on('chat', function (data) {
    console.log(data.messageContent + " was written");
    console.log(socket.handshake.session.userInfo);
    console.log("updates userInfo4 (socket)", data)
    //socket.handshake.session.userInfo = data;
    //socket.handshake.session.save();

    let message = data;


    addMessageUnReadInDB(data.receiverUserEmail, message, data.user.email);

    io.sockets.emit(data.user.email + '_chat', data);
    io.sockets.emit(data.receiverUserEmail + '_chat', data);
    io.sockets.emit(data.receiverUserEmail + '_chat_notification', data);

    saveMessageInDB(data.user.email, message, data.receiverUserEmail);
    // addMessageUnReadInDB(data.user.email, message, data.receiverUserEmail);

    saveMessageInDB(data.receiverUserEmail, message, data.user.email);

    // io.sockets.connected[data.user.socketID].emit('C_chat', data);
    // io.sockets.connected[data.receiverUser.socketID].emit('C_chat', data);
  })

  /**
   * sent by frontend for when a user starts/ends a battle with another user.
   * args: 
   * {
   *  newAvailability: 2 for unavailable or 1 for available
   *  userId: email of the given user
   *  roomId: the room in which the user currently participates
   * }
   */

  const userStates = {
    INVALID: 0,
    AVAILABLE: 1,
    UNAVAILABLE: 2
  }
  socket.on('changeUserAvailability', function (args) {

    logDiv('changeUserAvailability')

    var userEmail = socket.handshake.session.userInfo.email;
    console.log("email:", userEmail);

    findUser(
      { email: userEmail },
      (userObject) => {
        const roomId = userObject.roomObject.room_id;
        //  console.log("the current room:", roomId);
        args.roomId = roomId
        args.userId = userEmail

        //  console.log("newRoomId:", args.roomId, "newUserId:", args.userId)



        //   console.log("args:", args)
        changeUserAvailability(
          args.roomId,
          args.userId,
          args.newAvailability,
          (succ) => {
            //   console.log("database operation successful")
            // console.log(succ)
            // console.log("new availability:", args.newAvailability)
            // TODO: should the user socket leave the room?
            if (args.newAvailability === userStates.AVAILABLE) {
              // user becomes available -- his socket should rejoin the room
              console.log("emmiting available to", args.roomId, "with args", args.userId)
              socket.join(args.roomId.toString())
              io.to(args.roomId).emit('userAvailable', args.userId)
            } else {
              // user goes unavailable -- his socket should leave the room
              console.log("emmiting unavailable to", args.roomId, "with args", args.userId)
              io.to(args.roomId).emit('userUnAvailable', args.userId)
              socket.leave(args.roomId.toString())
            }
          },
          (err) => console.log(err)
        )


      },
      (err) => console.log(err)
    )
  })


  /**
   * does same as changeUserAvailability but for a list of users
   * args: 
   * {
   *  newAvailability: 2 for unavailable or 1 for available
   *  users: list of emails
   *  roomId: the room in which the users are currently participating
   * }
   */
  socket.on('changeAvailabilityAll', function (args) {

    logDiv('changeAvailabilityAll')


    console.log("args:", args)
    args.users.forEach(userId => {
      console.log(userId);
      changeUserAvailability(
        args.roomId,
        userId,
        args.newAvailability,
        (succ) => {
          console.log("database operation successful")
          console.log("new availability:", args.newAvailability)

          // TODO: should the user socket leave the room?
          if (args.newAvailability === userStates.AVAILABLE) {
            // user becomes available -- his socket should rejoin the room
            var sock = findSocketByUserId(userId)
            if (!isUndefined(sock)) { sock.join(args.roomId.toString()) }
          } else {
            // user goes unavailable -- his socket should leave the room
            var sock = findSocketByUserId(userId)
            if (!isUndefined(sock)) { sock.leave(args.roomId.toString()) }
          }
        },
        (err) => console.log(err)
      )
    })
    console.log("finished access to database")

    if (args.newAvailability === userStates.AVAILABLE) {
      io.to(args.roomId).emit('AllAvailable', args.users)
    } else if (args.newAvailability === userStates.UNAVAILABLE) {
      io.to(args.roomId).emit('AllUnAvailable', args.users)
    }
  })

  /**
   * Passes a message from one user to another.
   * 
   * usage format is:
   * serverSocket.emit('deliverMessage', {
   * message: 'letsPlay'
   * args: {}
   * receiverId: 'email@gmail.com'
   * })
   */
  socket.on('deliverMessage', function (data) {
    logDiv('delivering message')
    if (data.receiverId === undefined || data.message === undefined) {
      // handle error
      console.log("bad parameters. data.receiverId= ", data.receiverId, ". data.message= ", data.message);
      return;
    }
    var receiverSocket = findSocketByUserId(data.receiverId)
    if (receiverSocket === undefined) {
      // handle error
      console.log("receiver socket not found")
      return;
    }

    console.log(
      "sending message",
      data.message,
      "from ",
      socket.handshake.session.userInfo.email,
      "to",
      data.receiverId
    );

    data.args.senderId = socket.handshake.session.userInfo.email;

    receiverSocket.emit(data.message, data.args)
    logDiv()
  });


  /**
   * adding the message to the specific chat list between the two users
   * @param {the user that we add the message to his document} userEmail 
   * @param {includes the message content, author, receiver, time} message 
   */
  function saveMessageInDB(userEmail, message, otherUserEmail) {
    //todo: call db function to save it in the db
    var message_copy = JSON.parse(JSON.stringify(message));
    message_copy.otherUserEmail = otherUserEmail;
    message_copy.delivery_timestamp = new Date();
    addMessegesByAddressee(userEmail, message_copy, otherUserEmail, () => { }, (err) => { console.log(err) });
  }

  /**
   * adding the message to the recent messages list
   * @param {the user that we add the message to his document} userEmail 
   * @param {includes the message content, author, receiver, time} message 
   */
  function addMessageUnReadInDB(userEmail, message, otherUserEmail) {
    var message_copy = JSON.parse(JSON.stringify(message));
    message_copy.otherUserEmail = otherUserEmail;
    message_copy.delivery_timestamp = new Date();
    addUnReadMessage(userEmail, message_copy, () => { }, (err) => { console.log(err) });
  }

  /**
    * updates an existing user in a room with after match data
    * i.e. updates it's seen sentences and score.
    * parameter type:
    * data = {
    *  roomId: ... // id of room in which user is located
    *  user: ...  // user to update
    * }
    */
  socket.on('updateUserInRoom', function (data) {
    logDiv('updateUserInRoom')
    console.log('updating user', data.user.email, 'in room', data.roomId)
    findRoomById(
      data.roomId,
      (roomObject) => {
        //console.log('roomObject: ', roomObject);
        // update only the correct user in the room
        roomObject.users_in_room = roomObject.users_in_room.filter(x => !isUndefined(x))
        roomObject.users_in_room = roomObject.users_in_room.map(
          (userObject) => {
            if (userObject.email === data.user.email) {
              console.log("the user:", userObject)
              console.log("the new data:", data.user)
              userObject.score += data.user.score
              userObject.already_seen_sentences =
                userObject.already_seen_sentences.concat(data.user.already_seen_sentences)
            }
            return userObject
          }
        )

        // write back the room
        updateRoom(
          roomObject,
          (success) => {
            console.log("success")
          },
          (err) => console.log(err)
        )

      },
      (err) => console.log(err),
    )
  })

  socket.on('disconnect', function () {
    logDiv('new disconnect')
    console.log("disconnected " + socket.id)
    logDiv()
  })
})