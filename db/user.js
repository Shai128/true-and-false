const {mongoose} = require("./config")
const salt = '' //todo: change to a real good salt
const iterations = 1000;

const userSchema= new mongoose.Schema(
    { 
        email:String,
        password:String,
        salt: String,
        iterations: Number,
        nickName: String,
        current_room: Number,
        score: Number,
        pic_url: String,
        true_sentences:[{type:String}],
        false_sentences:[{type:String}],
        socket: Number
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
    console.log("entered");
    newUser.save((err)=>{
        if(err)
            failure(err)
        else 
            success()
    })
}


async function findUser(user_data, success, failure) {
    findUserByField(
        'username', 
        user_data.username,
        (users) => {
            if (users.length !== 1) {
                failure("no username " + user_data.username + " found.");
            } else {
                success(users[0]);
            }
        },
        failure)
}
//I added
async function deleteUser(data,success,failure){
    //console.log("entered delete user");
    const docs = await userModel.deleteOne({email: data.email});
    console.log("docs:"+docs);
    if(!docs){
        failure("no user with mail "+data.email +" found");
    } else {
        success("user with mail "+data.email+"was deleted successfuly" );
    }

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
exports.deleteUser=deleteUser
exports.findUserByField = findUserByField
exports.userModel = userModel   