const {mongoose} = require("./config")
const{isUndefined, removeUnReadMessagesFromCertainUser}=require("../src/Utils")
const salt = '' //todo: change to a real good salt
const iterations = 1000;
const LAST_MESSAGES_LIMIT=100
const USER_ALREADY_EXISTS = 'user already exists error'
const userSchema= new mongoose.Schema(
    { 
        email:String,
        password:String,
        salt: String,
        iterations: Number,
        nickName: String,
        roomObject: {
            room_id: Number,
            room_name: String
        },
        score: Number,
        pic_url: String,
        firstName: String,
        true_sentences:[{id: Number, value:String}],
        false_sentences:[{id: Number, value:String}],
        socket: Number,
        last_active_at:Date,
        games: {},
        unReadMessages:[{authorEmail: String,
                            otherUserEmail:String,
                            messageContent:String,
                            authorName: String,
                            otherUserName:String,
                            delivery_timestamp:Date
                            }],
        messeges_by_addressee:[{email_of_addressee:String,
                                nickname_of_addressee:String,
                                messages:[{authorEmail: String,
                                    otherUserEmail:String,
                                    messageContent:String,
                                    authorName: String,
                                    otherUserName:String,
                                    delivery_timestamp:Date}]
                            }],
        turn:Boolean,
        opponentId: String,
        questionsCount: Number,
        correctCount: Number,
        score: Number,
        matchPoints: Number,                   

        });
const userModel = mongoose.model('users',userSchema) //creating the class userModel. a class of types
                                                    // that comply the conditions of {userSchema and document}
    


/**
 * creates a new userModel object with the given user and saves it in the db
 * @param  user 
 * @param {function: what to do if the operation succeeded} success 
 * @param {function: what to do if the operation failed} failure 
 */
function createUser(user,success,failure){
    userModel.findOne({ email: user.email }).exec(function (err, dbUser) {
    if(err || dbUser === undefined || dbUser === null) {
        let hashedPassword = user.password;
        const newUser = new userModel({
            password: hashedPassword,
            email: user.email,
            salt: salt,
            iterations: iterations,
            nickName: user.nickName,
            firstName: user.firstName, 
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
    else{
        console.log("dbuser:", dbUser)
        failure(USER_ALREADY_EXISTS)
    }
    })
}

async function updateLastActiveAt(email,date,success,fail){
    console.log(date);
    userModel.findOneAndUpdate({email: email}, { $set:{ last_active_at :  date }},(err,doc)=>{
        if(err) fail('failed updated the last_active_at field of user with email '+email)
        else success('Successfully updated the last_active_at field of user with email '+email);   });
}

/**
 * author: Shai
 * @param {the user's email} email 
 * @param {the message that will be inserted} message_data 
 * @param {funciton to be executed in case of success} success 
 * @param {function to be executed in case of failure} fail 
 */
async function addUnReadMessage(email,message_data,success,fail){

    userModel.findOne({ email: email }).exec(function (err, user) {
        if(err) fail('User with email'+email+'does not exist');
        else{
            
            var extract_data={
                authorEmail
                :
                message_data.authorEmail,
                otherUserEmail
                :
                message_data.otherUserEmail,
                messageContent
                :
                message_data.messageContent,
                authorName
                :
                message_data.authorName,
                delivery_timestamp:message_data.delivery_timestamp
                
               }
            if(user == null)
               return;
            var res=user.unReadMessages;
            if(isUndefined(user.unReadMessages)||user.unReadMessages.length==0){
                res=[];
               res[0]=extract_data;
            }
            else if(user.unReadMessages.length<LAST_MESSAGES_LIMIT)
            res.unshift(extract_data);
            else{
                res.unshift(extract_data);
                res=res.slice(0,LAST_MESSAGES_LIMIT);
            }
            userModel.findOneAndUpdate({email: email}, { $set:{unReadMessages:res}},
            ()=>{success('Successfully added unread message to user with email '+email)}) }
            
            
        });

}

/** author: Shai
 * resets unread messages array
 */
async function resetUnReadMessage(email,success){
    userModel.findOneAndUpdate({email: email}, { $set:{unReadMessages:[]}},
        ()=>{success('Successfully added unread message to user with email '+email)});

}

/**
 * author: Shai
 * @param {the email of the current user (the user we change)} email 
 * @param {the user who wrote the messages we remove} otherUserEmail 
 * @param {function that activates on success } success 
 */
async function removeUnReadMessagesFromCertainUserInDB(email, otherUserEmail, success, fail){
    userModel.findOne({ email: email }).exec(function (err, user) {
   
        if(err) fail('User with email'+email+'does not exist');
        else{

        var unReadMessages = removeUnReadMessagesFromCertainUser(user, otherUserEmail)
        userModel.findOneAndUpdate({email: email}, { $set:{unReadMessages:unReadMessages}},
        ()=>{success('Successfully added  message by addressee to user with email '+email)}) }
            
            
        });
}




async function addMessegesByAddressee(user_email,message_data,otherUserEmail,success,fail){

    userModel.findOne({ email: user_email }).exec(function (err, user) {
   
        if(err) fail('User with email'+user_email+'does not exist');
        else{
            var extract_data={
                authorEmail
                :
                message_data.authorEmail,
                otherUserEmail
                :
                message_data.otherUserEmail,
                messageContent
                :
                message_data.messageContent,
                authorName
                :
                message_data.authorName,
                delivery_timestamp:message_data.delivery_timestamp
                
               }
            if(user == null)
               return;
            var res=user.messeges_by_addressee;
            if(isUndefined(user.messeges_by_addressee)){
                res=[];
               res[0]={email_of_addressee:otherUserEmail,
                messages:[extract_data]
                }
            }
            var not_found=1,i;
           for(i=0;i<res.length;i++){
               if(res[i].email_of_addressee==otherUserEmail){
                not_found=0;
                res[i].messages[res[i].messages.length]=extract_data;
               }
           }
           if(not_found){
               res[res.length]={email_of_addressee:otherUserEmail,
                messages:[extract_data]
                }
           }
            
            userModel.findOneAndUpdate({email: user_email}, { $set:{messeges_by_addressee:res}},
            ()=>{success('Successfully added  message by addressee to user with email '+user_email)}) }
            
            
        });

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

/**
 * ATTENTION TO WHO MAY USE THIS FUNCTION IN THE FUTURE
 * it returns AN ARRAY of all matching users.
 * so if you need a single user, you've got to take the [0] item of the array
 */
async function findUserByField(field, value, success, failure) {
    var query = {};
    query[field] = value;
    return userModel.find(query, (err, docs) => {
        if (err) {failure(err)} else {success(docs)}
    });
}

/**
 * author: Shai
 * @param {the _id of the user we want to update} userID 
 * @param {the email of the user we want to update} userEmail 
 * @param {the new user that will be put instead of the existing user} user 
 * @param {function that will activated in case of success} success 
 * @param {will be activated in case of failure} failure 
 */
async function updateUser(userID, userEmail, user, success, failure) {
    console.log("updating user by Id:", userID)
    console.log("updating user by email:", userEmail)

    console.log("the user object:", user)
    var res;
    if(!isUndefined(userID))
        res = await userModel.replaceOne({_id: userID}, user); //res.nModified = # updated documents
    else if(!isUndefined(userEmail))
        res = await userModel.replaceOne({email: userEmail}, user); //res.nModified = # updated documents
    else{
        failire('bad updateUser params. user was not updated');
        return;
    }

    if(res.n ==1 && res.nModified ==1) {                     //res.n = # of matched documents
        success();
        console.log('updated user. new user: ', user)
    }
    else if (res.n ==0 && res.nModified ==0){
        failure('could not find a user to update')
    }
    else if (res.n ==1 && res.nModified ==0){
        failure('user found, could not update')
    }
    else{
        failure('fatal error occured.')
    }
    // userModel.findOneAndUpdate({email: data.email}, { $set:{array:global_array.array}},()=>
                
    // const doc = await userModel.findOneIdAndUpdate(
    //     {_id: data._id},
    //     data
    // );

}




exports.removeUnReadMessagesFromCertainUserInDB = removeUnReadMessagesFromCertainUserInDB
exports.createUser = createUser
exports.findUser = findUser
exports.updateUser = updateUser
exports.deleteUser=deleteUser
exports.findUserByField = findUserByField
exports.userModel = userModel   
exports.updateLastActiveAt=updateLastActiveAt
exports.addUnReadMessage=addUnReadMessage
exports.resetUnReadMessage=resetUnReadMessage
exports.addMessegesByAddressee=addMessegesByAddressee
