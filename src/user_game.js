import { isUndefined } from './Utils.js'


const game_in_session_key = 'game in session key'

/**
 * read the user that was saved in the local storage and calls setUser with the user we found.
 */
export function getGameFromLocalStorage() {
    console.log('entered getGameFromLocalStorage function');
    var storage_game = (localStorage.getItem(game_in_session_key));
    if (!isUndefined(storage_game)) {
        var parsed_storage_game = JSON.parse(storage_game);
        return parsed_storage_game;
    }
}



export function updateGameInLocalStorage(game) {
    console.log("entered updateGameInLocalStorage")
    localStorage.setItem(game_in_session_key, JSON.stringify(game))
    console.log('saved game in local storage: ', game)
    console.log('now we have in local storage: ', JSON.parse(localStorage.getItem(game_in_session_key)));
}