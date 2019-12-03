/*Settings to access to the database to the collection containing the rooms*/
const {mongoose} = require("./config")
const{userModel} = require("./user")
const{roomsGlobalArrayModel}=require("./roomsGlobalArray")
const INVALID_STATE=0;
const UNVAILABLE_STATE=2;
const AVAILABLE_STATE=1;
const PLAYERS_AMOUNT=10;

const roomSchema = new mongoose.Schema(
    { 
        room_id: {type: Number, unique: true,required:true},
        all_sentences:[{type: String}],
        room_name: {type: String},
        state_array: [{type: Number}],
        available_id: {type: Number},
        users_in_room: 
            [{  user_id_in_room: Number,
                email: String,
                password:String,
                nickname: String,
                pic_url: String,
                array_of_ids_of_users_already_played_with: [{type: Boolean}],
                true_sentences:[{type: String}],
                already_seen_sentences:[{type: String}],
                score: Number
            }]        
    }
);
const roomModel = mongoose.model('rooms',roomSchema)



async function deleteRoomById(roomId,success,fail){
    await roomModel.deleteOne({room_id: roomId}, ()=>{});
}


async function updateRoom(data,success,fail){
    await roomModel.replaceOne({room_id:data.room_id}, data);
}

async function findRoomById(room_id, success, failure) {
    findRoomByField(
        'room_id', 
        room_id,
        (rooms) => {
            if (rooms.length !== 1) {
                failure("no room with id " + room_id + " found.");
            } else {
                success(rooms[0]);
            }
        },
        failure)
}
async function findRoomByField(field, value, success, failure) {
    var query = {};
    query[field] = value;
    return roomModel.find(query, (err, docs) => {
        if (err) {failure(err)} else {success(docs);}
    });
}



async function findUserByEmailInRoomByRoomID(room_id,email,success,fail){ //room_id: int, email: string
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) fail('Room with id'+room_id+'does not exist');
        else{
                arr_users=room.users_in_room;
               // console.log('got here: '+arr_users[0].email);
               var i; 
               var flag_not_found=1;
               for( i=0; i<arr_users.length; i++){

                    if(arr_users[i]!=undefined && arr_users[i].email==email){flag_not_found=0; success(arr_users[i])}
                }
                if(flag_not_found){fail('User with email ' +email+ ' was not found in room with id '+room_id)}
        }
    });
}




async function deleteUserByEmailInRoomByRoomID(room_id,email,success,fail){ //room_id: int, email: string
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) fail('Room with id'+room_id+'does not exist');
        else{   console.log('got here');
                var arr_users=room.users_in_room;
               var i,j;
               var flag_not_found=1;
               for( i=0; i<arr_users.length; i++){
                        if(arr_users[i]!=undefined && arr_users[i].email == email){ j=i;flag_not_found=0;}
                        
                }
                if(flag_not_found){fail('User with email ' +email+ ' was not found in room with id '+room_id)}
                else{ 

                    arr_users[j]=undefined;
                    room.state_array[j]=INVALID_STATE;
                    roomModel.findOneAndUpdate({room_id: room_id}, { $set:{users_in_room:arr_users,state_array: room.state_array }},()=>{
                        success('Successfully removed');
                    }) }
        }
    });   
}


async function addUserObjectToRoom(room_id,user,success,fail){
    //console.log('got here 3');
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) fail('Room with id'+room_id+'does not exist');
        else{
            //console.log('got here 4');
            orig_sentences_array_length=room.all_sentences.length;
            var i;
            for(i=0;i<user.true_sentences.length;i++){
                room.all_sentences[orig_sentences_array_length+i]=user.true_sentences[i];
            }
              var arr_users=room.users_in_room;
               arr_users[arr_users.length]=user;
               room.state_array[user.user_id_in_room]=AVAILABLE_STATE;
               roomModel.findOneAndUpdate({room_id: room_id}, { $set:{users_in_room:arr_users,state_array:room.state_array,available_id:(room.available_id+1),all_sentences:room.all_sentences}},
                ()=>{success('success')}) }
        });
}

async function addUserToRoom(room_id,email,success,fail){
//console.log('got here 1.5');
roomModel.findOne({ room_id: room_id }).exec(function (err1, room) {
    //console.log('got here 1');
        if(err1) fail('Room with id'+room_id+'does not exist');
        else{
           // console.log('got here 1');
            userModel.findOne({ email: email }).exec(function (err2, user) {
                if(err2) fail('User with email'+email+'does not exist');
                else{
                   // console.log('got here 2');
                    var false_array = new Array(PLAYERS_AMOUNT).fill(false);
                    var user={
                        user_id_in_room:room.available_id,
                        email: user.email,
                        password:user.password,
                        nickname: user.nickName,
                        pic_url: user.pic_url,
                        array_of_ids_of_users_already_played_with: false_array,
                        true_sentences: user.true_sentences,
                        already_seen_sentences: user.true_sentences,
                        score:0
                    }
               
                addUserObjectToRoom(room_id,user,success,fail);
                success('Success');
        }
    })
}});
           
}
async function createRoom(room_name,success,failure){
    roomsGlobalArrayModel.findOne({ array_id: 1 }).exec(function (err, global_array) {
        if(err) fail('unexpected error occured during fetching the rooms global array');
        else{
            var room_id,i;
            for(i=0;i<global_array.array.length;i++){
                if(!global_array.array[i]){
                    room_id=i
                    global_array.array[i]=true;
                    //console.log('i is:'+i);
                    break;
                }
            }
            const newRoom = new roomModel({
                room_id:room_id,
                all_sentences:[],
                room_name: room_name,
                available_id:0,
                state_array: [0,0,0,0,0,0,0,0,0,0,0,0],
                users_in_room:  []        


            });
            //saves the room in the db
            newRoom.save((err)=>{if(err){fail('failed creating a room')} else{
                roomsGlobalArrayModel.findOneAndUpdate({array_id: global_array.array_id}, { $set:{array:global_array.array}},()=>
                
                
                {success(room_id)}
        );  
        }
    })
}
    });
}

async function get_available_users(room_id,success,failure){
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) failure('Room with id'+room_id+'does not exist');
        else{
                var res=[];
                var i,j;
                for(i=0;i<room.state_array.length; i++){
                    if(room.state_array[i]==AVAILABLE_STATE && room.users_in_room[i]!=undefined){
                        res[j]=room.users_in_room[i];
                        j++;
                    }

                }
                console.log(res);
                success(res);
        }
});
}

async function get_unavailable_users(room_id,success,failure){
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) failure('Room with id'+room_id+'does not exist');
        else{
                var res=[];
                var i,j;
                for(i=0;i<room.state_array.length; i++){
                    if(room.state_array[i]!=AVAILABLE_STATE && room.users_in_room[i]!=undefined){
                        res[j]=room.users_in_room[i];
                        j++;
                    }

                }
                console.log(res);
                success(res);
        }
});
}

async function getAllSentencesArray(room_id,success,failure){ //room_id: int
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if(err) failure('Room with id'+room_id+'does not exist');
        else{//console.log('got here:'+room.all_sentences)
            
            success(room.all_sentences)}});
}
async function updateAllSentencesArray(room_id,all_senteces_array,success,fail){ //room_id: int, all_senteces_array: array of strings
    roomModel.findOneAndUpdate({room_id: room_id}, { $set:{all_sentences:all_senteces_array }},()=>{
        success('Successfully updated the sentences array');   
});}


exports.findRoomById = findRoomById
exports.updateRoom=updateRoom
exports.createRoom=createRoom
exports.deleteRoomById=deleteRoomById
exports.findUserByEmailInRoomByRoomID=findUserByEmailInRoomByRoomID
exports.deleteUserByEmailInRoomByRoomID=deleteUserByEmailInRoomByRoomID
exports.addUserObjectToRoom=addUserObjectToRoom
exports.addUserToRoom=addUserToRoom
exports.createRoom=createRoom
exports.get_available_users=get_available_users
exports.get_unavailable_users=get_unavailable_users
exports.getAllSentencesArray=getAllSentencesArray