/*Settings to access to the database to the collection containing the rooms*/
const { mongoose } = require("./config")
const { userModel } = require("./user")
const { isUndefined } = require("../src/Utils")
const { roomsGlobalArrayModel } = require("./roomsGlobalArray")
const { updateUser, findUserByField } = require("./user.js")
const INVALID_STATE = 0;
const UNVAILABLE_STATE = 2;
const AVAILABLE_STATE = 1;
const PLAYERS_AMOUNT = 10;

const roomSchema = new mongoose.Schema(
    {
        room_id: { type: Number, unique: true, required: true },
        all_sentences: [{ type: String }],
        room_name: { type: String },
        state_array: [{ type: Number }],
        available_id: { type: Number },
        users_in_room:
            [{
                user_id_in_room: Number,
                email: String,
                password: String,
                nickname: String,
                pic_url: String,
                array_of_ids_of_users_already_played_with: [{ type: Boolean }],
                true_sentences: [{ id: Number, value: String }],
                already_seen_sentences: [{ id: Number, value: String }],
                false_sentences: [{ id: Number, value: String }],
                score: Number
            }]
    }
);
const roomModel = mongoose.model('rooms', roomSchema)



async function deleteRoomById(roomId, success, fail) {
    await roomModel.deleteOne({ room_id: roomId }, () => { });
}


async function updateRoom(data, success, fail) {
    await roomModel.replaceOne({ room_id: data.room_id }, data);
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
        if (err) { failure(err) } else { success(docs); }
    });
}



async function findUserByEmailInRoomByRoomID(room_id, email, success, fail) { //room_id: int, email: string
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) fail('Room with id' + room_id + 'does not exist');
        else {
            var arr_users = room.users_in_room;
            // console.log('got here: '+arr_users[0].email);
            var i;
            var flag_not_found = 1;
            for (i = 0; i < arr_users.length; i++) {
                if (arr_users[i] != undefined && arr_users[i].email == email && room.state_array[i] !== INVALID_STATE) {
                    flag_not_found = 0;
                    success(arr_users[i])
                }
            }
            if (flag_not_found) { fail('User with email ' + email + ' was not found in room with id ' + room_id) }
        }
    });
}

/**
 * after removing or adding user to a room,
 * this function is called to update the in user object fields
 */
function changeRoomInUser(email, room_id, room_name, success, failure) {
    console.log("updating user:", email, "current_room_id:", room_id, "current_room_name:", room_name)
    findUserByField('email', email, (userObject) => {
        userObject = userObject[0]
        userObject.roomObject = {
            room_id: room_id,
            room_name: room_name
        }
        // console.log("user should update to:", userObject)
        updateUser(
            null,
            email,
            userObject,
            (succ) => {
                console.log("update successful")
                success(succ)
            },
            (err) => failure(err)
        )
    }, (err) => failure(err))
}

/**
 * This function is called when deleting a room.
 * Goes over all the users in the room (they are still there in invalid state).
 * For each user, if the user still exists in the system: appends the room object to the user's game history.
 * 
 * Saves only the following fields:
 * {
 *  room name: ...
 *  users_in_room: a list. for each user:
 *      {
 *          true sentences,
 *          false_sentences,
 *          email,
 *          nickname,
 *          score
 *      }
 * }
 */
async function addRoomToAllUserGameHistory(roomObject) {
    console.log("add room to user history called with room object:", roomObject);
    var reducedRoomObject = {
        room_name: roomObject.room_name,
        users_in_room: roomObject.users_in_room.map(
            function (userObject) {
                return {
                    true_sentences: userObject.true_sentences,
                    false_sentences: userObject.false_sentences,
                    email: userObject.email,
                    nickname: userObject.nickname,
                    score: userObject.score
                }

            }
        )
    }
    console.log("the reduced object:", reducedRoomObject);

    reducedRoomObject.users_in_room.forEach(function (userObject) {
        addRoomToUserGameHistory(userObject.email, reducedRoomObject);
    })
}

/**
 * Checks if user exists, and if so - adds a given room to the user's game history
 */
async function addRoomToUserGameHistory(userEmail, reducedRoomObject) {
    console.log("adding room to game history of:", userEmail);
    findUserByField(
        'email',
        userEmail,
        (userObject) => {
            userObject = userObject[0];
            userObject.gameHistory.push(reducedRoomObject);
            updateUser(
                undefined,
                userEmail,
                userObject,
                (succ) => { console.log("successfuly updated user") },
                (err) => console.log(err)
            )
        },
        (err) => console.log("failed to add room to game history. error:", err)
    )
}

async function deleteUserByEmailInRoomByRoomID(room_id, email, success, fail) { //room_id: int, email: string
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) fail('Room with id' + room_id + 'does not exist');
        else {
            console.log('got here');
            if (!room) room = { users_in_room: [], state_array: [] }
            var arr_users = room.users_in_room;
            var i, j = 0;
            var flag_not_found = 1;
            for (i = 0; i < arr_users.length; i++) {
                if (arr_users[i] != undefined && arr_users[i].email == email) { j = i; flag_not_found = 0; }

            }
            if (flag_not_found) { fail('User with email ' + email + ' was not found in room with id ' + room_id) }
            else {
                room.state_array[j] = INVALID_STATE;
                roomModel.findOneAndUpdate({ room_id: room_id }, { $set: { state_array: room.state_array } }, () => {

                    changeRoomInUser(email, -1, "no room", async () => {
                        var flag = 0;
                        console.log('got here1');
                        for (i = 0; i < arr_users.length; i++) {
                            if (room.state_array[i] !== INVALID_STATE) flag = 1;

                        }
                        if (flag === 0) {
                            console.log("deleting room:", room_id);
                            addRoomToAllUserGameHistory(room)

                            await roomModel.remove({ room_id: room_id });
                            roomsGlobalArrayModel.findOne({ array_id: 1 }).exec(function (err, arr) {
                                if (err) { fail('shit'); console.log('should not get here') }
                                else {
                                    console.log('the array is:', arr.array);
                                    arr.array[room_id] = false;
                                    roomsGlobalArrayModel.findOneAndUpdate({ array_id: 1 }, { $set: { array: arr.array } }, () => {
                                    });
                                }

                            })
                        }
                        success('Successfully removed');
                    })

                },
                    (err) => fail(err));
            }
        }
    }

    );
}


async function addUserObjectToRoom(room_id, user, success, fail) {
    //console.log('got here 3');
    console.log("inside addUserObjectToRoom the user:", user)
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) fail('Room with id' + room_id + 'does not exist');
        else {
            var already_in_room = false;
            // check if user already in room. if so -- just update it's status
            var i;
            for (i = 0; i < room.users_in_room.length; i++) {
                if (room.users_in_room[i].email === user.email) {
                    room.state_array[i] = AVAILABLE_STATE;
                    already_in_room = true;
                }
            }

            var arr_users = room.users_in_room;
            if (!already_in_room) {

                //console.log('got here 4');
                var orig_sentences_array_length = room.all_sentences.length;
                var i;
                for (i = 0; i < user.true_sentences.length; i++) {
                    room.all_sentences[orig_sentences_array_length + i] = user.true_sentences[i].value;
                }
                for (i = 0; i < user.false_sentences.length; i++) {
                    room.all_sentences[orig_sentences_array_length + i] = user.false_sentences[i].value;
                }
                arr_users[arr_users.length] = user;
                room.state_array[user.user_id_in_room] = AVAILABLE_STATE;
            }

            roomModel.findOneAndUpdate({ room_id: room_id }, {
                $set: {
                    users_in_room: arr_users,
                    state_array: room.state_array,
                    available_id: (already_in_room ? room.available_id : room.available_id + 1),
                    all_sentences: room.all_sentences
                }
            },
                () => { success({ roomObject: room, userObject: user }) })
        }
    });
}

async function addUserToRoom(room_id, email, success, fail) {
    console.log('addUserToRoom got params: room_id: ', room_id + " email: ", email);
    roomModel.find({ room_id: room_id }, (err, docs) => {
        var room = docs[0]
        if (room === undefined) { fail("room does not exist"); return }
        if (err) { fail(err) } else {
            console.log('addUserToRoom. room ', room_id + "found. ");
            userModel.findOne({ email: email }).exec(function (err2, user) {
                if (err2) fail('trying to add user to room. ', room_id + ' User with email' + email + 'does not exist');
                else {
                    console.log('addUserToRoom found user: ', user);
                    var false_array = new Array(PLAYERS_AMOUNT).fill(false);
                    var userInRoom = {
                        user_id_in_room: room.available_id,
                        email: user.email,
                        password: user.password,
                        nickname: user.nickName,
                        pic_url: user.pic_url,
                        array_of_ids_of_users_already_played_with: false_array,
                        true_sentences: user.true_sentences,
                        false_sentences: user.false_sentences,
                        already_seen_sentences: (user.true_sentences).concat(user.false_sentences),
                        score: 0
                    }

                    changeRoomInUser(user.email, room_id, room.room_name, (succ) => {
                        console.log("updated the user in the database, now calling addUserObjectToRoom")
                        addUserObjectToRoom(room_id, userInRoom, success, fail);
                    }, (err) => fail(err))

                }
            })
        }
    })
}

async function createRoom(room_name, success, failure) {
    roomsGlobalArrayModel.findOne({ array_id: 1 }).exec(function (err, global_array) {
        if (err) { failure('unexpected error occured during fetching the rooms global array') }
        else {

            if (isUndefined(global_array)) {
                console.log("golbal array is undefined");
                global_array = {
                    array_id: 1,
                    array: (new Array(100)).fill(false)
                }
                const new_global_array = new roomsGlobalArrayModel(global_array);
                //saves the user in the db
                new_global_array.save((err) => {
                    if (err)
                        failure(err)
                    else
                        success()
                });
            }

            var room_id, i;
            for (i = 0; i < global_array.array.length; i++) {
                if (!global_array.array[i]) {
                    room_id = i
                    console.log("found free spot for room id:", room_id)
                    global_array.array[i] = true;
                    //console.log('i is:'+i);
                    break;
                }
            }
            var state_array = new Array(10).fill(INVALID_STATE);
            const newRoom = new roomModel({
                room_id: room_id,
                all_sentences: [],
                room_name: room_name,
                available_id: 0,
                state_array: state_array,
                users_in_room: []


            });
            // console.log("saving new room:", newRoom)
            //saves the room in the db
            newRoom.save((err) => {
                if (err) { console.log(err); failure('failed creating a room') } else {
                    roomsGlobalArrayModel.findOneAndUpdate({ array_id: global_array.array_id }, { $set: { array: global_array.array } }, () => { success(room_id) }
                    );
                }
            })
        }
    });
}

async function getRoomSize(room_id, success, failure) {
    roomModel.find({ room_id: room_id }, (err, docs) => {
        if (err) { failure(err) } else { success(docs[0].users_in_room.length) }
    });
}

async function get_available_users(room_id, success, failure) {
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) failure('Room with id' + room_id + 'does not exist');
        else {
            var res = [];
            var i = 0, j = 0;
            for (i = 0; i < room.state_array.length; i++) {
                if (room.state_array[i] === AVAILABLE_STATE && room.users_in_room[i] !== undefined) {
                    res[j] = room.users_in_room[i];
                    //console.log("new user added to list:", i, j)
                    j++;
                }

            }
            // console.log(res);
            success(res);
        }
    });
}
async function changeUserAvailability(room_id, email, status, success, fail) {
    console.log("inside db changeUserAvailability")
    console.log("roomId:", room_id, "email:", email)
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) fail('Room with id' + room_id + 'does not exist');
        else {
            var i, not_found = 1;
            for (i = 0; i < room.users_in_room.length; i++) {
                if (!isUndefined(room.users_in_room[i]) && (room.users_in_room[i].email === email)) {
                    console.log("found the user index", i)
                    console.log("email:", room.users_in_room[i].email)
                    not_found = 0;
                    room.state_array[i] = status;
                    break;
                }
            }
            if (not_found) fail('User with email ' + email + ' was not found in room with id ' + room_id);
            else {
                roomModel.findOneAndUpdate({ room_id: room_id }, { $set: { state_array: room.state_array } },
                    () => { success('Successfully changed the availabilty of user with email ' + email + ' in room with id ' + room_id); })
            }

        }
    }
    );
}
async function get_unavailable_users(room_id, success, failure) {
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) failure('Room with id' + room_id + 'does not exist');
        else {
            var res = [];
            var i, j = 0;
            for (i = 0; i < room.state_array.length; i++) {
                if (room.state_array[i] !== AVAILABLE_STATE && room.users_in_room[i] !== undefined) {
                    res[j] = room.users_in_room[i];
                    j++;
                }

            }
            //  console.log(res);
            success(res);
        }
    });
}

async function getAllSentencesArray(room_id, success, failure) { //room_id: int
    roomModel.findOne({ room_id: room_id }).exec(function (err, room) {
        if (err) failure('Room with id' + room_id + 'does not exist');
        else {//console.log('got here:'+room.all_sentences)

            success(room.all_sentences)
        }
    });
}
async function updateAllSentencesArray(room_id, all_senteces_array, success, fail) { //room_id: int, all_senteces_array: array of strings
    roomModel.findOneAndUpdate({ room_id: room_id }, { $set: { all_sentences: all_senteces_array } }, () => {
        success('Successfully updated the sentences array');
    });
}


exports.findRoomById = findRoomById
exports.updateRoom = updateRoom
exports.createRoom = createRoom
exports.deleteRoomById = deleteRoomById
exports.findUserByEmailInRoomByRoomID = findUserByEmailInRoomByRoomID
exports.deleteUserByEmailInRoomByRoomID = deleteUserByEmailInRoomByRoomID
exports.deleteUserFromRoom = deleteUserByEmailInRoomByRoomID
exports.addUserObjectToRoom = addUserObjectToRoom
exports.addUserToRoom = addUserToRoom
exports.createRoom = createRoom
exports.getAvailableUsers = get_available_users
exports.getUnAvailableUsers = get_unavailable_users
exports.getAllSentencesArray = getAllSentencesArray
exports.getRoomSize = getRoomSize
exports.roomModel = roomModel
exports.changeUserAvailability = changeUserAvailability