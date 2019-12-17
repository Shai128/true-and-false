const mongoose = require('mongoose');
const userModel = require('../db/user.js');
const general = require("../db/general")
function clearDB() {
    try{
        general.resetDatabase(5,() => {
        console.log("success")
    }, (err) => {
        console.log("error while reseting DB")
        console.error(err)
    })
    } catch (error){
        console.warn(error)
    }
}
const UserModel = userModel.userModel //mongoose.model('usersForTests',temp)
const userData = { 
    email: 'siraj93.o@gmail.com', 
    password: '1234', 
    salt: '456', 
    nickkname: 'siraj93',
    firstName: 'siraj',
    iterations: 2

};

describe('User Model Test', () => {

    // It's just so easy to connect to the MongoDB Memory Server 
    // By using mongoose.connect
    beforeAll(async () => {
        await mongoose.connect("mongodb://localhost:27017/TrueAndFalse", { useNewUrlParser: true , 
        useUnifiedTopology: true}, (err) => {
            if (err) {
                console.log("Error in beforeAll")
                console.error(err);
                process.exit(1);
            }
        });
        //clearDB();
        
    });
    
    afterAll(async () => {
        clearDB();
    });

    xit('create & save user successfully', async () => {
        const info = userData
        info.email = "firsfunction@testing.com"
        const validUser = new UserModel(info);
        try {
            const savedUser = await validUser.save().catch(err => console.warn(err));
        } catch (error){
            let err = error
        }
        // Object Id should be defined when successfully saved to MongoDB.
        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toEqual(userData.email);
        expect(savedUser.password).toEqual(userData.password);
        expect(savedUser.salt).toEqual(userData.salt);
        expect(savedUser.nickname).toEqual(userData.nickname);
        expect(savedUser.firstName).toEqual(userData.firstName);
    });

    // Test Schema is working!!!
    // You shouldn't be able to add in any field that isn't defined in the schema
    it('insert user successfully, but the field does not defined in schema should be undefined', async () => {
        const userWithInvalidField = new UserModel({ firstname: 'George', gender: 'Male', nickname: 'The destroyer' });
        const savedUserWithInvalidField = await userWithInvalidField.save();
        expect(savedUserWithInvalidField._id).toBeDefined();
        expect(savedUserWithInvalidField.gender).toBeUndefined();
    });

    // Test Validation is working!!!
    // It should us told us the errors in on gender field.
    xit('Create user without any fields since no field is required', async () => {
        const userWithoutFields = new UserModel();
        let err;
        try {
            const savedUserWithoutFields = await userWithoutFields.save();
            
        } catch (error) {
            err = error
        }
        
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.gender).toBeDefined();
    });

    
})


describe("User Model Function Create user", () => {
    let spy
    beforeAll(async () => {
        await mongoose.connect("mongodb://localhost:27017/TrueAndFalse", { useNewUrlParser: true , 
        useUnifiedTopology: true}, (err) => {
            if (err) {
                console.log("Error in beforeAll")
                console.error(err);
                process.exit(1);
            }
        });
        //clearDB()
        spyOn(userModel,"createUser").and.callThrough()
        spyOn(userModel,"updateUser").and.callThrough()
        spyOn(userModel,"findUser").and.callThrough()
        spyOn(userModel,"deleteUser").and.callThrough()
        spyOn(console,"log")
    
    });
    
 
    afterEach(async () => {
        clearDB();
        userModel.createUser.calls.reset()

    });
    
    it("normal test", async () => {
        
        var userToAdd = new UserModel(userData)
        const savedUser = userModel.createUser(userToAdd,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.createUser).toHaveBeenCalledTimes(1)
        
    });

    xit("duplicate user insertion", async () => {
        var userinfo = userData
        userinfo.email = "fake@testing.com"
        var userToAdd = new UserModel(userinfo)
        const savedUser = userModel.createUser(userToAdd,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.createUser).toHaveBeenCalledTimes(1)
        
        const savedUserfailure = userModel.createUser(userToAdd,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log(msg)
        })
        
        expect(userModel.createUser).toHaveBeenCalledTimes(2)
        expect(console.log).toHaveBeenCalled()
    })

    it("Create - update - find - delete", async () => {
        var userinfo = userData
        userinfo.email = "Create_update_del_basic@testing.com"
        var userToAdd = new UserModel(userinfo)
        userModel.createUser(userToAdd,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.createUser).toHaveBeenCalledTimes(1)
        const foundUser = userModel.findUser(userToAdd,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.findUser).toHaveBeenCalledTimes(1)

        var newUser = userinfo
        newUser.email = "newMail@testing.com"
        const updatedUser = userModel.updateUser(foundUser._id, newUser,function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.updateUser).toHaveBeenCalledTimes(1)
        expect(updatedUser).toBeDefined()

        userModel.deleteUser(newUser, function(msg){
            console.log("succesfully added userToAdd", msg)
        },function(msg){
            console.log("error while adding user;", msg)
        })
        expect(userModel.deleteUser).toHaveBeenCalledTimes(1)
    } );

/*
exports.createUser = createUser
exports.findUser = findUser
exports.updateUser = updateUser
exports.deleteUser=deleteUser
*/


})
