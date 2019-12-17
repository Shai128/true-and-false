var Room = require('../db/rooms')
var roomsGlobalArrayModel = require("../db/roomsGlobalArray")

//Create Spy object for roomModel with all the available functions and spy on each one's call parameters and so..
describe('Room creation',function(){
    let originalLogFunc, originalFindone
    const mongoose = require("mongoose")
    beforeAll(function(){
        spyOn(Room,"createRoom").and.callThrough();
    })
    beforeEach(function(){
        originalLogFunc = console.log;
        console.log = jasmine.createSpy("log")
        
    })
    afterEach(function() {
         console.log = originalLogFunc;
         originalLogFunc = undefined
    })

    it('Create a new room', async function(){
        const res = await Room.createRoom("room1",function(msg){
            console.log(msg)
        },function(msg){
            console.log(msg)
        })
        expect(Room.createRoom).toHaveBeenCalledTimes(1);
        //expect(console.log).toHaveBeenCalledTimes(1); //if only one call means success, more means failure
        const res1 = await Room.createRoom("room1",function(msg){
            console.log(msg)
        },function(msg){
            console.log(msg)
        });
        expect(Room.createRoom).toHaveBeenCalledTimes(2);
        
    });
    it("testing console reads",function(){
        var funct_to_test = function () {
            console.log("fail")
        }
        var res = funct_to_test()
        expect(console.log).toHaveBeenCalledWith("fail")
    })
});