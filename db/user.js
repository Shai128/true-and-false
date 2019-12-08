const {mongoose} = require("./config")
const{isUndefined}=require("../src/Utils")
const salt = '' //todo: change to a real good salt
const iterations = 1000;
const LAST_MESSAGES_LIMIT=100
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
        firstName: String,
        true_sentences:[{type:String}],
        false_sentences:[{type:String}],
        socket: Number,
        last_active_at:Date,
        games: {},
        all_last_messages:[{authorEmail: String,
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
                            }]                   

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
    console.log("entered");
    newUser.save((err)=>{
        if(err)
            failure(err)
        else 
            success()
    })
}
async function updateLastActiveAt(email,date,success,fail){
    console.log(date);
    userModel.findOneAndUpdate({email: email}, { $set:{ last_active_at :  date }},(err,doc)=>{
        if(err) fail('failed updated the last_active_at field of user with email '+email)
        else success('Successfully updated the last_active_at field of user with email '+email);   });
}

async function addLastMessage(email,message_data,success,fail){

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
               
            var res=user.all_last_messages;
            if(isUndefined(user.all_last_messages)||user.all_last_messages.length==0){
                res=[];
               res[0]=extract_data;
            }
            else if(user.all_last_messages.length<LAST_MESSAGES_LIMIT)
            res.unshift(extract_data);
            else{
                res.unshift(extract_data);
                res=res.slice(0,LAST_MESSAGES_LIMIT);
            }
            userModel.findOneAndUpdate({email: email}, { $set:{all_last_messages:res}},
            ()=>{success('Successfully added last message to user with email '+email)}) }
            
            
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

async function findUserByField(field, value, success, failure) {
    var query = {};
    query[field] = value;
    return userModel.find(query, (err, docs) => {
        if (err) {failure(err)} else {success(docs)}
    });
}
/*
async function updateUser(data, success, failure) {
    userModel.findOneAndUpdate({email: data.email}, { $set:{array:global_array.array}},()=>
                

    const doc = await userModel.findOneIdAndUpdate(
        {_id: data._id},
        data
    );
    console.log("updated: " + doc);

}*/




exports.createUser = createUser
exports.findUser = findUser
//exports.updateUser = updateUser
exports.deleteUser=deleteUser
exports.findUserByField = findUserByField
exports.userModel = userModel   
exports.updateLastActiveAt=updateLastActiveAt
exports.addLastMessage=addLastMessage
exports.addMessegesByAddressee=addMessegesByAddressee