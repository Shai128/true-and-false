import { okStatus, serverIP, isUndefined } from './Utils.js'
import { reject } from 'q';
const server = "http://"+ serverIP + ':8000'
export function getSentencesFromDB(opponentId, room, onSuccess, onFailure) {

  console.log("request:", server + '/userSentences/' + opponentId + '/' + room.room_id)
  fetch(server + '/userSentences/' + opponentId + '/' + room.room_id, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include',
  }).then((response) => {
    if (response.status !== okStatus) {
      reject(response.status)
      if (!isUndefined(onFailure))
        onFailure();
    } else {
      return new Promise(function (resolve, reject) {
        resolve(response.json());
      })
    }
  }).then(data => {
    if (!isUndefined(onSuccess))
      onSuccess(data);


    console.log("userSentences received data from server: ", data)
  })

}