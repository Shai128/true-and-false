var request = require("request");

var base_url = "http://localhost:3000/"
describe("GET from Server", function() {
  it("returns status code 200", function() {
    request.get(base_url, function(error, response, body) {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});

var db = require('../../db/user')
const fetch = require("node-fetch");
describe("Server Create Requests", function () {
  var user
  var res
  beforeAll(function() {
    spyOn(db,"createUser");
    user = {  password: "123",
              email: "george@gmail.com",
              salt: "",
              iterations:"",
              nickName:"George The Destroyer",
              username: "George"
            }
    db.createUser(user,()=>{res = 'success'},(msg)=>{res = msg});
  });

  it('CreateUser func',function (){
    expect(db.createUser).toHaveBeenCalledTimes(1);
    expect(res).toEqual('success')

  });

 

  it('Create User with Fetch',function () {
    fetch('http://localhost:8000/user', {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              credentials: 'include',
              body: 'json='+JSON.stringify( user )
            }).then((response) => {
      expect(response.status).toBe(200)
    })
  });
});


describe("Server Get Requests",function (){
  var user
  var res
  beforeAll(function(){
    let user = {username :"siraj93" ,
    password : "1234" }
    fetch('http://localhost:8000/user/' + user.username + '/' + user.password, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include'
    }).then((response)=> {
      res = response
    });
  });

  it("Status res",function (){
    expect(res.status).toBe(200);
    expect(res.statusText).toEqual('OK');
  })
})