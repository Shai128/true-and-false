export const okStatus = 200;

export function isUndefined(val){
    return typeof val === 'undefined' || val == null;
}


export function passwordIsStrongEnough(password){
    return !isUndefined(password) && password.length >= 6; // todo: hash the entered old password
}


export function validEmail(email) {
    if(isUndefined(email))
        return false;
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};