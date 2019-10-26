const express  = require("express") //express contains functions including app, which is the server
const {createUser } =require("../db/user") //imports create user

const app = express()
const port = 8000

app.use(express.json())

app.get('/', (req, res) => res.send("request for / recieved"))

app.get('/welcome',(req,res)=> res.send(`hello ${req.body.shalom.bla}`))

app.post('/user',(req,res)=> {
    console.log("haha");
    createUser(req.body.username,
    ()=>{res.send("success")},(err)=>{console.log(err)});
        //console.log(req);
}
     
      )

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

console.log("123")