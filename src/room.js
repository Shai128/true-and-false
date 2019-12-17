import {okStatus, /*isUndefined*/} from './Utils.js'
import { reject } from 'q';
import { updateUserInLocalStorage } from './user.js';
const server = 'http://localhost:8000';

/**
 * 
 * @param {the name of the room} roomName 
 * @param {the current user} currentuser 
 * @param {the nick name the user chose for this room} currentGameNickName 
 */
export function createRoom(roomName, currentuser, currentGameNickName, history){
    fetch(server + '/createRoom/' + roomName, {
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
        }).then(roomAndUserObject => {
            console.log("received roomAndUserObject:", roomAndUserObject)
            let new_user = JSON.parse(JSON.stringify(currentuser));
            new_user.roomObject = roomAndUserObject.roomObject;
            updateUserInLocalStorage(new_user);
            history.push({
                pathname: '/LoginScreen/JoinGame',
                InfoObject: roomAndUserObject,
            });
            
           
        }, fail_status => {
        console.log("failed, status:", fail_status)
        });
}

/**
 * 
 * @param {the user will join that roomID} roomID 
 * @param {the current user} user 
 * @param {the nickname the user chose for this room} currentGameNickName 
 */
export function joinRoom(roomID, currentuser, currentGameNickName, history){
    fetch(server + '/joinRoom/' + roomID, {
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
        }).then(roomAndUserObject => {

            history.push({
                pathname: '/LoginScreen/JoinGame',
                InfoObject: roomAndUserObject,
            });

        }, fail_status => {
        console.log("failed, status:", fail_status)
        });
}