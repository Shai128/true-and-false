import { okStatus, server, isUndefined } from './Utils.js'
import { reject } from 'q';
import { updateUserInLocalStorage } from './user.js';

/**
 * 
 * @param {the name of the room} roomName 
 * @param {the current user} currentuser 
 * @param {the nick name the user chose for this room} currentGameNickName 
 * @param {what to do in case of success. receives roomAndUserObject from the db.} onSuccess;
 * @param {what to do when failes. receives the failure error } onFailure
 */
export function createRoom(roomName, currentuser, currentGameNickName, history, onSuccess, onFailure) {
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
            if (!isUndefined(onFailure))
                onFailure(response.status);
        } else {
            return new Promise(function (resolve, reject) {
                resolve(response.json());
            })
        }
    }).then(roomAndUserObject => {
        console.log("received roomAndUserObject:", roomAndUserObject)
        if (!isUndefined(onSuccess))
            onSuccess(roomAndUserObject);
        let new_user = JSON.parse(JSON.stringify(currentuser));
        new_user.roomObject = roomAndUserObject.roomObject;
        updateUserInLocalStorage(new_user);
        history.push({
            pathname: '/LoginScreen/JoinGame',
            InfoObject: roomAndUserObject,
        });

    }, fail_status => {
        if (!isUndefined(onFailure))
            onFailure(fail_status);
        console.log("failed, status:", fail_status)
    });
}

/**
 * 
 * @param {the user will join that roomID} roomID 
 * @param {the current user} user 
 * @param {the nickname the user chose for this room} currentGameNickName 
 * @param {what to do in case of success. receives roomAndUserObject from the db.} onSuccess;
 * @param {what to do when failes. receives the failure error } onFailure
 */
export function joinRoom(roomID, currentuser, currentGameNickName, history, onSuccess, onFailure) {
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
            if (!isUndefined(onFailure))
                onFailure(response.status);
        } else {
            return new Promise(function (resolve, reject) {
                resolve(response.json());
            })
        }
    }).then(roomAndUserObject => {
        if (!isUndefined(onSuccess))
            onSuccess(roomAndUserObject);
        let new_user = JSON.parse(JSON.stringify(currentuser));
        new_user.roomObject = roomAndUserObject.roomObject;
        updateUserInLocalStorage(new_user);
        history.push({
            pathname: '/LoginScreen/JoinGame',
            InfoObject: roomAndUserObject,
        });

    }, fail_status => {
        if (!isUndefined(onFailure))
            onFailure(fail_status);
        console.log("failed, status:", fail_status)
    });
}