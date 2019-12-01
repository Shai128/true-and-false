
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


/**
 * a dummy function that returns an empty user;
 */
export function getCurrentUser(){
    return emptyUser();
}

/**
 * note- this function does nothing if the user contains an email that is not ''
 * @param {the user that will be assigned with the user from the session} user 
 * @param {a function that sets the user from the session to the user variable} setUser 
 */
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

/**
 * 
 * @param {the user that is checked if updated} user 
 * returns true if the user has an email.
 */
function userIsUpdated(user){
    return !isUndefined(user) && !isUndefined(user.email) && user.email !== '';
}

/**
 * 
 * @param {the user to be updated to the DB} user 
 * edits the user with the same user_.id and puts instead the given user
 */
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

/**
 * returns a user with no content. can be used as an initial value for a user.
 */
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

/**
 * 
 * @param {the props that contains the user} props 
 * returns the user from the props. if the props doesn't contain a user, it returns an empty user.
 */
export function getUserFromProps(props){
    if(!isUndefined(props) &&!isUndefined(props.location) && !isUndefined(props.location.user))
        return props.location.user;
    if(!isUndefined(props) &&!isUndefined(props.user))
        return props.user;
    return emptyUser();
}

/**
 * 
 * @param {the props we use to read the user} props 
 * @param {used to set the user from the session if it is not in the props} setUser 
 * sets the user from props, if exists in props, or reads the user from the db and sets with setUser.
 */
export function getUserFromPropsOrFromSession(props,user, setUser){
    if(userIsUpdated(user)){
        return;
    }
    setUser(getUserFromProps(props))    
    getCurrentUserFromSession(user, setUser)
}


// this function will be changed because func is not supposed to access STATUS.
/**
 * 
 * @param {contains the email and password of the user that is willing to log in} user 
 * @param {a function that will be executed after a successful login} func 
 * tries to log in with the given user. saves the user in the session in case of successful login.
 */
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