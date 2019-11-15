const express  = require("express") //express contains functions including app, which is the server
const {createUser } =require("../db/user") //imports create user
const {findUser } = require("../db/user")
const {updateUser} = require("../db/user")
const app = express()
const port = 8000
bodyParser = require("body-parser")


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
    },(err)=>{
      console.log(err)
      res.send(err);
    });

})


app.get('/randomSentence/:username', (req, res) => {
  console.log('random sentence');
  let data = {
    username: req.params.username,
  }
  findUser(data,
    (found_user)=>{
      const truths = found_user.get('truths');
      const lies = found_user.get('lies');
      if (truths.length >= 1 && lies.length >= 1) {
        let is_true = (Math.random() >= 0.5) ? 1 : 0;
        let arr = [lies, truths][is_true];
        let sentence = arr[Math.floor(Math.random() * arr.length)];
        console.log("chosen sentense: " + sentence + ", is_true: " + is_true);
        res.send(JSON.stringify({
          is_true: is_true,
          sentence: sentence
        }))
      } else { // TODO: should probably look at another user's sentences first
        console.log("not enough sentences for user: " + req.params.username);
        res.send("not enough sentences");
      }
    },(err)=>{
      console.log(err)
      res.send(err);
    });

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
    ,(err)=>{
      console.log(err)
      res.send(err);
    });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

console.log("123")