const express  = require("express") //express contains functions including app, which is the server
const {
        createUser,
        findUser, 
        updateUser,
        findUserByField
      } =require("../db/user") //imports create user

const {
        GetRandomSentence,
        StandardErrorHandling
      } = require("./server_util")

const app = express()
const port = 8000
bodyParser = require("body-parser")

const socket = require('socket.io')


app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

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
    ()=>{res.send("success")},(err)=>{StandardErrorHandling(res, err)});
})

/**
 * a simple login function
 * TODO: should create a session and save it on the database
 */
app.get('/user/:username/:password', (req, res) => {
  console.log('get user');
  let data = {
    username: req.params.username,
    password: req.params.password
  }
  findUser(data,
    (found_user)=>{
      if (found_user.password === data.password) { // TODO: should later change to hash(password)
        console.log("successfuly returned user: " + found_user.get('username'));
        res.send(JSON.stringify(found_user));
      } else {
        console.log("the password: " 
          + data.password 
          + " does not match for username: " 
          + data.username);
        res.send("password does not match");
      }
    },(err)=>{StandardErrorHandling(res, err)});
})

/**
 * receives a username and returns a random sentence about him
 * with probability 50/50 of the sentence being true.
 * Only works if the user has at least one truth and at least one lie.
 */
app.get('/randomSentence/:username', (req, res) => {
  console.log('random sentence');
  let data = {
    username: req.params.username,
  }
  findUser(data,
    (found_user)=>{
      GetRandomSentence(found_user, [], 
        (data) => {
          console.log("chosen sentense: " + data.sentence + ", is_true: " + data.is_true);
          res.send(JSON.stringify(data))
        },
        (err)=>{StandardErrorHandling(res, err)}
      )
    },(err)=>{StandardErrorHandling(res, err)});

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
    (err) => StandardErrorHandling(res, err)
  );
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server);

console.log("123")
const rooms = [];
io.on('connection', function(socket){
  console.log('tut bananim')

  socket.on('chat', function(data){
    io.sockets.connected[data.user.socketID].emit('chat',data);
    io.sockets.connected[data.receiverUser.socketID].emit('chat',data);
  });


  socket.on('joinRoom', function(data){
    for(let i)
    io.sockets.connected[data.user.socketID].emit('chat',data);
    io.sockets.connected[data.receiverUser.socketID].emit('chat',data);
  });

})

