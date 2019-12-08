 const okStatus = 200;

 function isUndefined(val){
    return val === 'undefined' || typeof val === 'undefined' || val == null;
}


 function passwordIsStrongEnough(password){
    return !isUndefined(password) && password.length >= 6; // todo: hash the entered old password
}


 function validEmail(email) {
    if(isUndefined(email))
        return false;
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};
exports.okStatus=okStatus
exports.isUndefined=isUndefined
exports.passwordIsStrongEnough=passwordIsStrongEnough
exports.validEmail=validEmail