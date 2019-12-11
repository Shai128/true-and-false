
import {okStatus, isUndefined} from './Utils.js'
import { reject } from 'q';
const server = 'http://localhost:8000';
const user_in_session_key = 'user in session key'
const  players= [{firstName: 'alon', nickName: 'alon', email:'123@gmail.com'}, {firstName: 'km', nickName: 'debil', email:'k@gmai.com',}, {firstName: 'Dan', nickName: 'Halif', email: 'dan@gmail.com'}];
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
export const socket = io.connect(server, {query: "user_id="+getUserFromLocalStorage().email});


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
 * @param {function that activates in case of failure} onFailure
 * @param {function that activates in case of success} onSuccess
 */
export function getCurrentUserFromSession(user, setUser, onSuccess , onFailure){
    
    if(userIsUpdated(user)){
        /*
        if(!isUndefined(onSuccess))
            onSuccess(user);
            */
        return;
    }
    /** getting the current user from the local storage, if exists */
    var storage_user = getUserFromLocalStorage();
    if(!isUndefined(storage_user)){
        setUser(storage_user);
        if(!isUndefined(onSuccess))
            onSuccess(storage_user);
        return;
    }
    

    getCurrentUserFromDB(setUser, onSuccess, onFailure);
}


/**
 * read the user that was saved in the local storage and calls setUser with the user we found.
 */
export function getUserFromLocalStorage(){
    console.log('entered getUserFromLocalStorage function');
    var storage_user = (localStorage.getItem(user_in_session_key));
    if(!isUndefined(storage_user)){
        var parsed_storage_user = JSON.parse(storage_user);
        if(userIsUpdated(parsed_storage_user)){
            fillUserUndefinedData(parsed_storage_user);
            console.log('used local storage to get: ', parsed_storage_user)
            return parsed_storage_user;
        }
    }
}

function fillUserUndefinedData(user){
    if(isUndefined(user.true_sentences))
        user.true_sentences = [];
    if(isUndefined(user.false_sentences))
        user.false_sentences = [];
}


/**
 * reads the user from the db, even if he is in localStorage
 * @param {the user that will be assigned with the user from the session} user 
 * @param {a function that sets the user from the session to the user variable} setUser 
 * @param {function that activates in case of failure} onFailure
 * @param {function that activates in case of success} onSuccess
 */
export function getCurrentUserFromDB(setUser, onSuccess , onFailure){
    

    fetch(server+'/getUserFromSession', {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include'
    }).then(response => {
    console.log("response:", response)
    console.log("response status:", response.status)
    if (response.status !== okStatus) {
        reject(response.status);
        onFailure();
    } else {
        return new Promise(function(resolve, reject) {
        resolve(response.json());
        })
    }
    }).then(user => {
        if(!userIsUpdated(user)){
            return;
        }
        fillUserUndefinedData(user);
        if(!isUndefined(onSuccess))
            onSuccess(user);
        console.log('frontend got data: ', user);
        setUser(user);
        /** saving the user we just got to local storage, so next time we will access the user from local storage */
        updateUserInLocalStorage(user);
        

    }, fail_status => {
    console.log("failed, status:", fail_status)
    });
}


export function updateUserInLocalStorage(user){
    localStorage.setItem(user_in_session_key, JSON.stringify(user))
    console.log('saved in local storage: ', user)
    console.log('now we have in local storage: ',  JSON.parse(localStorage.getItem(user_in_session_key)));
}

export function logOut(){
    fetch(server + '/logout', {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include'
        })
    .then(response => {
        console.log("response status:", response.status)
        if (response.status !== okStatus) {
            reject(response.status);
        } else {
            return new Promise(function(resolve, reject) {
            resolve(response);
            })
        }
    }, fail_status => {
        console.log("failed, status:", fail_status);
    });
    localStorage.removeItem(user_in_session_key);
}

/**
 * 
 * @param {the user that is checked if updated} user 
 * returns true if the user has an email.
 */
export function userIsUpdated(user){
    return !isUndefined(user) && !isUndefined(user.email) && user.email !== '';
}

/**
 * 
 * @param {the user to be updated to the DB} user 
 * edits the user with the same user_.id and puts instead the given user
 */
export function updateUserToDB(user){
    updateUserInLocalStorage(user);
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
        true_sentences: [],
        false_sentences: [],
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
    if(!isUndefined(props) &&!isUndefined(props.location) && !isUndefined(props.location.user)
     && userIsUpdated(props.location.user))
        return props.location.user;
        
    if(!isUndefined(props) &&!isUndefined(props.user) && userIsUpdated(props.user))
        return props.user;
    return emptyUser();
}

/**
 * 
 * @param {the props we use to read the user} props 
 * @param {used to set the user from the session if it is not in the props} setUser 
 * sets the user from props, if exists in props, or reads the user from the db and sets with setUser.

export function getUserFromPropsOrFromSession(props, setUser){
    var user = getUserFromProps(props);
    if(userIsUpdated(user)){
        setUser(user)
        return user;
    }
    getCurrentUserFromSession(user, setUser)
}
 */

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
        }).then(response => {
            console.log("response:", response)
            console.log("response status:", response.status)
            func(response);
            if (response.status !== okStatus) {
                reject(response.status);
            } else {
                return new Promise(function(resolve, reject) {
                resolve(response.json());
                })
            }
            }).then(user => {
                if(!userIsUpdated(user)){
                    return;
                }
                
                socket.emit('login', {email: user.email,user_id: user.email, nickName: user.nickName});
                console.log('frontend got data: ', user);
                /** saving the user we just got to local storage, so next time we will access the user from local storage */
                localStorage.setItem(user_in_session_key, JSON.stringify(user));
                console.log('saved in local storage: ', user)
                console.log('now we have in local storage: ',  JSON.parse(localStorage.getItem(user_in_session_key)));
        
            }, fail_status => {
            console.log("failed, status:", fail_status)
            });   
}

export function resetUnreadMessages(email){
    fetch(server + '/user/resetUnReadMessages/'+email, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include'
        })
    .then(response => {
        console.log("response status:", response.status)
        if (response.status !== okStatus) {
            reject(response.status);
        } else {
            return new Promise(function(resolve, reject) {
            resolve(response);
            })
        }
    }, fail_status => {
        console.log("failed, status:", fail_status);
    });
    var user = getUserFromLocalStorage();
    user.unReadMessages = [];
    updateUserInLocalStorage(user);
}


export function resetUnreadMessagesFromCertainUser(email, otherUserEmail){
    fetch(server + '/user/resetUnReadMessagesFromCertainUser/'+email+'/'+otherUserEmail, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include'
        })
    .then(response => {
        console.log("response status:", response.status)
        if (response.status !== okStatus) {
            reject(response.status);
        } else {
            return new Promise(function(resolve, reject) {
            resolve(response);
            })
        }
    }, fail_status => {
        console.log("failed, status:", fail_status);
    });
    var user = getUserFromLocalStorage();
    user.unReadMessages = removeUnReadMessagesFromCertainUser(user, otherUserEmail)
    updateUserInLocalStorage(user);
}

/**
 * returns an array of all unReadMessages that were not written by otherUserEmail from user's unReadMessages
 * @param {the user we read from} user 
 * @param {the other user that the (first) given user's unReadMessages will be ereased from} otherUserEmail 
 */
export function removeUnReadMessagesFromCertainUser(user, otherUserEmail){
    var unReadMessages = user.unReadMessages;
    var newUnReadArray = []
    for(let message of unReadMessages){
        if(message.authorEmail !== otherUserEmail)
            newUnReadArray.push(message);
    }
    return newUnReadArray;
}
