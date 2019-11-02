const {mongoose} = require("./config")

const userSchema = new mongoose.Schema({ username: String , password:String});
const userModel = mongoose.model('user',userSchema) //creating the class userModel. a class of types
                                                    // that comply the conditions of {userSchema and document}

/**
 * creates a new userModel object with the given username and saves it in the db
 * @param {String} username 
 * @param {function: what to do if the operation succeeded} success 
 * @param {function: what to do if the operation failed} failure 
 */
function createUser(givenUserName, givenPassword,success,failure){
    const newUser = new userModel({ username: givenUserName,
                                    password: givenPassword });
    //saves the user in the db
    newUser.save((err)=>{
        if(err)
            failure(err)
        else 
            success()
    })
}

exports.createUser = createUser


