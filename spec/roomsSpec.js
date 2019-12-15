var Room = require('../db/rooms')


//Create Spy object for roomModel with all the available functions and spy on each one's call parameters and so..
describe('Room creation',function(){
    beforeAll(function(){
        spyOn(Room,"createRoom").and.callThrough()

    })
    it('Create a new room', async function(){
        const res = await Room.createRoom("room1",function(msg){
        expect(Room.createRoom).toHaveBeenCalledTimes(1);
        const res1 = await Room.createRoom("room1");
        expect(Room.createRoom).toHaveBeenCalledTimes(2);
    });
});