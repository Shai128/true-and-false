
export function getUnreadMessages(user){
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
}


