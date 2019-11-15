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