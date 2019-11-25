
const  players= [{firstName: 'alon', nickName: 'alon', email:'123@gmail.com'}, {firstName: 'km', nickName: 'debil', email:'k@gmai.com',}, {firstName: 'Dan', nickName: 'Halif', email: 'halifadan@gmail.com'}];
export function getCreatedGames(){
    var arr = [];
    arr[3] =  {
        name: 'my best room',
        id:3,
        date: '8.11.2019',
        playersNum: 3,
        players: players
        };
    arr[0] = {
        name: "koby's room",
        id:0,
        date: '6.11.2016',
        playersNum: 20,
        players: players
    };
    return arr;
}


export function getParticipatedGames(){
    var arr = [];
    arr[1] ={
        name: 'I love this game!',
        id: 1,
        date: '20.3.2017',
        playersNum: 5,
        players:players
    };
    arr[2] = {
        name: 'join my game!',
        id: 2,
        date: '22.3.2017',
        playersNum: 100,
        players:players
        };
    return arr;
}


const io = require('socket.io-client');
export const socket = io('http://localhost:8000');



export function getCurrentUser(){
    return {
        email: "email@gmail.com",
        nickName: 'my special nickname',
        password: 'password',
        truths: [{id: 0, value:"My name is Alon"}, {id: 1,value:"I have Pizza"}],
        lies: [{id:0, value:"I love computer science"}, {id:1, value:"this is a lie"}]
    }
}