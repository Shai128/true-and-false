const statusCodes = {
    OK: 200,
    UNDEFINED: 500,
    USER_EXISTS: 501,
    USER_DOES_NOT_EXIST: 502,
    PASSWORD_MISMATCH: 503
}
const okStatus = statusCodes.OK;
const serverIP = 'localhost'
const httpServerIP = 'http://' + serverIP
const server = httpServerIP + ':8000'
console.log('server: ', server)
function isUndefined(val) {
    return val === 'undefined' || typeof val === 'undefined' || val == null;
}


function passwordIsStrongEnough(password) {
    return !isUndefined(password) && password.length >= 6; // todo: hash the entered old password
}


function validEmail(email) {
    if (isUndefined(email))
        return false;
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

/**
 * returns an array of all unReadMessages that were not written by otherUserEmail from user's unReadMessages
 * @param {the user we read from} user 
 * @param {the other user that the (first) given user's unReadMessages will be ereased from} otherUserEmail 
 */
function removeUnReadMessagesFromCertainUser(user, otherUserEmail) {
    var unReadMessages = user.unReadMessages;
    var newUnReadArray = []
    for (let message of unReadMessages) {
        if (message.authorEmail !== otherUserEmail)
            newUnReadArray.push(message);
    }
    return newUnReadArray;
}
function isNumeric(num) {
    return !isNaN(num)
}
exports.isNumeric = isNumeric
exports.isUndefined = isUndefined
exports.removeUnReadMessagesFromCertainUser = removeUnReadMessagesFromCertainUser
exports.passwordIsStrongEnough = passwordIsStrongEnough
exports.validEmail = validEmail
exports.serverIP = serverIP;
exports.server = server;
exports.statusCodes = statusCodes
exports.okStatus = okStatus