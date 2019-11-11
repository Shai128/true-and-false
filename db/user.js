const {mongoose} = require("./config")
const salt = '' //todo: change to a real good salt
const iterations = 1000;

const userSchema = new mongoose.Schema(
    { 
        password:String,
        email: String,
        salt: String,
        iterations: Number,
        nickName: String,
        //games: {} //todo
        });
const userModel = mongoose.model('user',userSchema) //creating the class userModel. a class of types
                                                    // that comply the conditions of {userSchema and document}

/**
 * creates a new userModel object with the given user and saves it in the db
 * @param  user 
 * @param {function: what to do if the operation succeeded} success 
 * @param {function: what to do if the operation failed} failure 
 */
function createUser(user,success,failure){
    let hashedPassword = user.password; //todo: activate pbkdf2
    const newUser = new userModel({
        password: hashedPassword,
        email: user.email,
        salt: salt,
        iterations: iterations,
        nickName: user.nickName,
        //games: {} // creating a user with no games
                                 });
    //saves the user in the db
    newUser.save((err)=>{
        if(err)
            failure(err)
        else 
            success()
    })
}


exports.createUser = createUser


