import {okStatus, /*isUndefined*/} from './Utils.js'
import { reject } from 'q';
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
        }).then(room => {
            console.log('createRoom frontend got data: ', room);
            history.push({
                pathname: "JoinGame",
                user: currentuser, 
                RoomId: room.ID,
            }); // moves to main page (localhost:3000)

        });
}

/**
 * 
 * @param {the user will join that roomID} roomID 
 * @param {the current user} user 
 * @param {the nickname the user chose for this room} currentGameNickName 
 */
export function joinRoom(roomID, user, currentGameNickName){
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
        }).then(succ => {
            console.log('frontend got data: ', user);
            //todo: redirect to Dan's page with the roomID and the user! H-A-L-I-F!
        }, fail_status => {
        console.log("failed, status:", fail_status)
        });
}