const { isUndefined, statusCodes } = require("../src/Utils")

function updateGame(game, success, failure) { } // placeholder

function standardErrorHandling(res, err) {
  console.log(err)
  res.sendStatus(err)
}

function endSession(req, res) {
  req.session.destroy((err) => { standardErrorHandling(res, err) })
  req.session = null
  res.redirect('/')
}

function getIdentifierFromSession(req, success, failure) {
  logDiv("getIdentifierFromsEssion");
  console.log("session:", req.session)

  if (isUndefined(req.session.userInfo) || !req.session.userInfo.email) {
    failure(statusCodes.NOT_LOGGED_IN);
    logDiv();
  } else {
    const id = req.session.userInfo.email;
    console.log("id from session:", id)
    logDiv();
    success(id)
  }
}

function getUserInfoFromSession(req, success, failure) {
  logDiv("getUserINFOFromSession")
  console.log("session:", req.session);
  const info = req.session.userInfo;
  if (!info) { logDiv(); failure(statusCodes.NOT_LOGGED_IN) } else {
    console.log("info from session:", info)
    logDiv()
    success(info)
  }
}

function convertUserListFormat(fullUserList) {
  return Object.values(fullUserList)
}

function logDiv(header = '') {
  const divLen = 60
  header = header.slice(0, divLen)
  const divWithoutHeader = divLen - header.length;
  console.log("-".repeat(divWithoutHeader / 2) + header + '-'.repeat((divWithoutHeader + 1) / 2))
}

exports.standardErrorHandling = standardErrorHandling
exports.endSession = endSession
exports.getIdentifierFromSession = getIdentifierFromSession
exports.logDiv = logDiv
exports.getUserInfoFromSession = getUserInfoFromSession
exports.convertUserListFormat = convertUserListFormat