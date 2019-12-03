const express  = require("express") //express contains functions including app, which is the server
const{createRoom}=require("../db/rooms")
const{get_available_users}=require("../db/rooms")
const{get_unavailable_users}=require("../db/rooms")
const{deleteUserByEmailInRoomByRoomID}=require("../db/rooms")
const{getAllSentencesArray}=require("../db/rooms")
/*
const {
  createUser,
  findUser,
  updateUser,
  findUserByField
} = require("../db/user") // imports all user functions

/*const {
  createRoom,
  addUserToRoom
} = require("../db/rooms") //imports all room functions

const {
  getRandomSentence,
  standardErrorHandling,
  getRandomSentenceForDuel,
  getIdentifierFromSession,
  logDiv
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
*/
const app = express()
const port = 8000
const bodyParser = require("body-parser")
const socket = require('socket.io')
/*
// Session stuff:
const sharedsession = require("express-socket.io-session");
const cookieParser = require("cookie-parser")
app.use(cookieParser())
app.use(session);
*/
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

/*
const {
  findGame,
} = require("../db/game")*/
function f(){
  getAllSentencesArray(1,(fg)=>{console.log(fg)},(fg)=>{})
}

f();
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))