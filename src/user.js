export function getCreatedGames(){
    return [
        {
        name: 'my best room',
        id:0,
        date: '8.11.2019',
        playersNum: 3
    },
    {
        name: "koby's room",
        id:1,
        date: '6.11.2016',
        playersNum: 20
    }];
}


export function getParticipatedGames(){
    return [
        {
        name: 'I love this game!',
        id: 0,
        date: '20.3.2017',
        playersNum: 5
    },
    {
        name: 'join my game!',
        id:1,
        date: '22.3.2017',
        playersNum: 100
    }];
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