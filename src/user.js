
import {okStatus, isUndefined} from './Utils.js'
import { reject } from 'q';
const server = 'http://localhost:8000';
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
export const socket = io('server');



export function getCurrentUser(){
    return {
        firstName: '',
        email: "",
        nickName: '',
        password: '',
        truths: [],
        lies: []
    }
}

export function getCurrentUserFromSession(user, setUser){
    if(userIsUpdated(user))
        return;
    
    fetch(server+'/getUserFromSession', {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include'
    }).then(response => {
    console.log("response status:", response.status)
    if (response.status !== okStatus) {
        reject(response.status);
    } else {
        return new Promise(function(resolve, reject) {
        resolve(response.json());
        })
    }
    }).then(user => {
        console.log('frontend got data: ', user);
        setUser(user);
        console.log("updated user", JSON.stringify(user))
    }, fail_status => {
    console.log("failed, status:", fail_status)
    });
}

function userIsUpdated(user){
    return !isUndefined(user) && !isUndefined(user.email) && user.email !== '';
}

export function updateUserToDB(user){
    fetch(server+'/userupdate/'+user._id, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'json=' + JSON.stringify(user)
              });
}

export function emptyUser(){
    return {
        firstName: '',
        nickName: '',
        email: '',
        password: '',
        truths: [],
        lies: [],
        createdGames: [],
        participatedGames: []
    }
}

export function getUserFromProps(props){
    if(!isUndefined(props) &&!isUndefined(props.location) && !isUndefined(props.location.user))
        return props.location.user;
    if(!isUndefined(props) &&!isUndefined(props.user))
        return props.user;
    return emptyUser();
}

export function getUserFromPropsOrFromSession(props, setUser){
    var user = getUserFromProps(props);
    if(userIsUpdated(user)){
        setUser(user)
        return user;
    }
    getCurrentUserFromSession(user, setUser)
}

export function logIn(user, func){
    fetch(server+'/user/'+user.email+'/'+user.password, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: user,
        credentials: 'include'
        }).then(func);   
}