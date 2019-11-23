const express  = require("express") //express contains functions including app, which is the server
const {
        createUser,
        findUser, 
        updateUser,
        findUserByField
      } =require("../db/user") //imports create user
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

const {
        standardErrorHandling,
        endSession,
        getRandomSentenceForDuel
      } = require("./server_util")

const app = express()
const port = 8000
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session);
const mongoose = require("../db/config")


app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session({
  secret: "some very good secret",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    url: "mongodb://localhost:27017/TrueAndFalse"
  })
}))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", 'Content-Type');
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
  });

app.get('/', (req, res) => res.send("request for / recieved"))

app.get('/welcome',(req,res)=> res.send(`hello ${req.body.shalom.bla}`))

app.post('/user',(req,res)=> {
    console.log('got here');
    let data = JSON.parse(req.body.json)
    createUser(data,
    ()=>{res.send("success")},(err)=>{standardErrorHandling(res, err)});
})

/**
 * a simple login function
 * TODO: should create a session and save it on the database
 */
app.get('/user/:username/:password', (req, res) => {
  console.log('get user');

  console.log(req.session.username) // just for debug
  if (! req.session.myInt) { req.session.myInt = 1}
  console.log(req.session.myInt ++)

  let data = {
    username: req.params.username,
    password: req.params.password
  }

  findUser(data,
    (found_user)=>{
      if (found_user.password === data.password) { // TODO: should later change to hash(password)
        req.session.username = data.username
        console.log("successfuly returned user: " + found_user.get('username'));
        res.send(JSON.stringify(found_user));
      } else {
        console.log("the password: " 
          + data.password 
          + " does not match for username: " 
          + data.username);
        res.send("password does not match");
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))