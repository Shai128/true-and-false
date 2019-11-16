const express  = require("express") //express contains functions including app, which is the server
const {createUser } =require("../db/user") //imports create user
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
    ()=>{res.send("success")},(err)=>{console.log(err)});}
     
      )

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server);

console.log("123")

io.on('connection', function(socket){
  console.log('tut bananim')

  socket.on('chat', function(data){
    io.sockets.emit('chat', data)
  })

})

io.listen(port);