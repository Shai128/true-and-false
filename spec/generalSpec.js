xdescribe("Creating a new Room", function (){
    var room_name
    var current_user
    var game_nick_name
    var historyObj 
    beforeAll(function(){
        let room_name = 'test_room'
        let current_user = 'test_user'
        let game_nick_name = 'test_nick'
        let historyObj = (msg)=>{};
        spyOn("../src/room","createRoom").and.callThrough;
        createRoom(room_name,current_user,game_nick_name,historyObj)
    })
    it('validate A normal call',function(){
        expect(createRoom).toHaveBeenCalledTimes(1);
        expect(createRoom).toHaveBeenCalledWith('test_room',
        'test_user', 'test_nick', history)
        
    });

});

describe("Check Chat",function(){
    var Chat
    var user1, user2,user3;
    var message1, message2, message3,message4;
    var _res = [];
    beforeAll(function(){
        function messageCreator(msg, time){
            return {content: msg, sendingTime: time};
        }
        Chat = jasmine.createSpy("getUnreadMessages").and.callFake(function(user) {
            let lastConnectedTime = user.lastConnectedTime; //todo: modify to the real field name
            let recentMessages = user.recentMessages; //todo: modify to the real field name
        
            let unreadMessages = [];
            for(let message of recentMessages){
                let messageTime = message.sendingTime; //todo: modify to the real field name
                if(lastConnectedTime < messageTime){ //todo: check if I can do this
                    unreadMessages.push(message);
                }
                else
                    break;
            }
            return unreadMessages;
        });
        
        message1 = messageCreator('first Message',0)
        message2 = messageCreator('second message', 1)
        message3 = messageCreator('third message', 1)
        message4 = messageCreator('fourth message', 5)
        let _messages =[]
        _messages.push(message4)
        _messages.push(message3)
        _messages.push(message2)
        _messages.push(message1)
        user1 = { lastConnectedTime: 0 , recentMessages: _messages};
        user2 = { lastConnectedTime: 1 , recentMessages: _messages};
        user3 = { lastConnectedTime: -1 , recentMessages: _messages};
        //spyOn(Chat,"getUnreadMessages").and.callThrough
        //_res = 
    });
    beforeEach(function(){
        Chat.calls.reset();
    })
    it("User 1 only read the first message", function(){
        expect(Chat(user1)).toEqual(
            [message4, message3, message2]);
        expect(Chat).toHaveBeenCalledTimes(1); 
        expect(Chat).toHaveBeenCalledWith(user1);
    });

    it("user2 Didn't read message4",function(){
        expect(Chat(user2)).toEqual(
            [message4]
        );
        expect(Chat).toHaveBeenCalledTimes(1); 
        expect(Chat).toHaveBeenCalledWith(user2);
    })

    it("user3 Didn't read any message",function(){
        expect(Chat(user3)).toEqual(
            [message4, message3, message2, message1]
        );
        expect(Chat).toHaveBeenCalledTimes(1); 
        expect(Chat).toHaveBeenCalledWith(user3);
    })

});