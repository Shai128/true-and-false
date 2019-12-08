const {mongoose} = require("./config")
const{userModel} = require("./user")
const{roomsGlobalArrayModel}=require("./roomsGlobalArray")
const{roomModel}=require("./rooms")



async function resetDatabase(room_num_limit,success,fail){ //room_id: int, email: string
    roomModel.deleteMany({},function (err){if(err)fail('Failed to delete rooms')});
    userModel.deleteMany({},function (err){if(err)fail('Failed to delete users')});
    var arr = new Array(room_num_limit).fill(false);
    roomsGlobalArrayModel.findOneAndUpdate({array_id:1}, {$set:{array:arr}},function (err){if(err) fail('Failed to reset rooms global array')});
    success('succesfully reseted the database')
}

exports.resetDatabase=resetDatabase