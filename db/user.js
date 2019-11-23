const {mongoose} = require("./config")
const salt = '' //todo: change to a real good salt
const iterations = 1000;

const userSchema = new mongoose.Schema(
    { 
        password: {type: String, required: true},
        email: {type: String, unique: true, required: true},
        salt: String,
        iterations: Number,
        nickName: {type: String, required: true},
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
        if(err) {
            switch(err.code) {
                case 11000:
                    failure("email already taken");
                    break;
                default:
                    failure(err)
            }
        }
        else 
            success()
    })
}


async function findUser(user_data, success, failure) {
    findUserByField(
        'email', 
        user_data.email,
        (users) => {
            if (users.length !== 1) {
                failure("no email " + user_data.email + " found.");
            } else {
                success(users[0]);
            }
        },
        failure)
}

async function findUserByField(field, value, success, failure) {
    var query = {};
    query[field] = value;
    return userModel.find(query, (err, docs) => {
        if (err) {failure(err)} else {success(docs)}
    });
}

async function updateUser(data, success, failure) {
    const doc = await userModel.findOneIdAndUpdate(
        {_id: data._id},
        data
    );
    console.log("updated: " + doc);

}




exports.createUser = createUser
exports.findUser = findUser
exports.updateUser = updateUser
exports.findUserByField = findUserByField

