const {mongoose} = require("./config")


const roomsGlobalArraySchema = new mongoose.Schema(
    { 
        array_id:{type: Number},
        array: {type:[Boolean]}
       });
const roomsGlobalArrayModel = mongoose.model('roomsglobalarrays',roomsGlobalArraySchema)


/*
async function updateRoomsGlobalArray(data){

    //const newRoom = new roomsGlobalArray({array_id:2,array: data});
    //newRoom.save((err)=>{});
    
    //console.log('got to update:'+data);
    await roomsGlobalArray.replaceOne( {array_id:1},{ array_id:1, array:data});
    //console.log('got to update2');
}


async function help1( success, failure) {
    help2(
        'array_id', 
        1,
        (array) => {
            if (array.length !== 1) {
                failure("error accured with getting the global array");
            } else {
                success(array[0]);
            }
        },
        failure)
}


async function help2(field, value, success, failure) {
    var query = {};
    query[field] = value;
    return roomsGlobalArray.find(query, (err, docs) => {
        if (err) {failure(err)} else {success(docs)}
    });
}


/**
 * returns the whole document that represents global array
 * @param  {function: (arr)=>{extract array by: arr.array} } success  
 * @param {function: what to do if the operation failed} failure 
 */
/*
  function getRoomsGlobalArray(success) {
     
    help1(
        (found_array)=>{
           success( found_array);
          }
        ,(err)=>{
          console.log(err)
        
        });
      
    }


exports.getRoomsGlobalArray = getRoomsGlobalArray
exports.updateRoomsGlobalArray=updateRoomsGlobalArray
*/
exports.roomsGlobalArrayModel=roomsGlobalArrayModel