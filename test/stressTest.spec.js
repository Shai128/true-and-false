import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
import 'babel-polyfill';
const iPhone = puppeteer.devices['iPhone 6'];

/*
    READ ME

    this is the stress test.
    parameters can be set to change its stress.
    the test is divided to 4 phases.
    all instances run concurrently in each phase.
    they all syncronize between each 2 phases, meaning they wait until all other instances finish the current phase before continuing to the next one.

    phase 1: sign in and fill sentences OR log in (depending on INITIALIZE_PLAYERS flag).
        user names are numbers from 0 to NUM_OF_PLAYERS
    phase 2: create rooms.
        users 0 to NUM_OF_ROOMS will open a room.
    phase 3: join rooms.
        all the remaining users will be split evenly between the created rooms.
    phase 4: invite to match and play match again and again, NUM_OF_MATCHES_PER_COUPLE times. then leave the room and log out.
        all users in each room are randomly split into couples (if there is an odd number of players in a room, some user will not play).
        then each couple is playing matches again and again.
    
    to run the test use the command "jest stressTest.spec.js"
*/

let pages = []
let page;
let browser;
const width = 1000;
const height = 600;
const pass = "000000"

//test parameters
const HEADLESS = true
const TEST_SLOWDOWN = 40 //around 40-60 is regular user behavior
const INITIALIZE_PLAYERS = false //true for signing up new users and filling up their sentences. false for signing in already registered users.
const NUM_OF_PLAYERS = 30
const NUM_OF_ROOMS = 6
const NUM_OF_MATCHES_PER_COUPLE = 1
const NUM_OF_TRUE_SENTENCES = 2
const NUM_OF_FALSE_SENTENCES = 2
const MAX_SETBACK = 50000 //[seconds/1000]
const MIN_TIME_TO_CHOOSE = 700 //[seconds/1000]
const MAX_TIME_TO_CHOOSE = 2300 //[seconds/1000]
const TIME_BETWEEN_PHASES = 300 //[seconds/1000]

//helper functions
var RemoveElement = function (myArray, randomItem) {
    var index = myArray.indexOf(randomItem);
    if (index > -1) {
        myArray.splice(index, 1);
    }
}
var GetRandomElement = function (myArray, deleteFlag) {
    var randomItem = myArray[Math.floor(Math.random() * myArray.length)];
    if (deleteFlag == true) {
        RemoveElement(myArray, randomItem);
    }
    return randomItem;
}

//procedures
var signUp = function (page, index) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#SignUpPage')
        await page.click("#firstName");
        await page.type("#firstName", index.toString());
        await page.click("#nickName");
        await page.type("#nickName", index.toString());
        await page.click("#email");
        await page.type("#email", index.toString() + "@gmail.com");
        await page.click("#password");
        await page.type("#password", pass);
        await page.click("#confirmPassword");
        await page.type("#confirmPassword", pass);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#submit')
        ]);
        await page.waitForSelector('#MySentencesPage')
        resolve("yes")
    });
}
var signIn = function (page, index) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector("#SignInPage")
        await page.click("#EmailInput");
        await page.type("#EmailInput", index.toString() + "@gmail.com");
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", pass);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#submit')
        ]);
        var success = true
        await page.waitForSelector("#LoginScreenHomePage").catch(() => success = false)
        if (!success) {
            await page.reload()
            await page.waitForSelector("#SignInPage")
            await page.click("#EmailInput");
            await page.type("#EmailInput", index.toString() + "@gmail.com");
            await page.click("#PasswordInput");
            await page.type("#PasswordInput", pass);
            await Promise.all([
                page.waitForNavigation(),
                page.click('#submit')
            ]);
        }
        await page.waitForSelector("#LoginScreenHomePage")
        resolve("yes")
    });
}
var fillSentences = function (page, index) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#MySentencesPage')
        var i
        for (i = 0; i < NUM_OF_TRUE_SENTENCES; i++) {
            await Promise.all([
                page.waitForSelector("#TrueSentence" + i.toString()),
                page.click('#addTrueSentenceBTN')
            ]);
            await page.click("#TrueSentence" + i.toString());
            await page.type("#TrueSentence" + i.toString(), index.toString() + "_true");
        }
        for (i = 0; i < NUM_OF_FALSE_SENTENCES; i++) {
            await Promise.all([
                page.waitForSelector("#FalseSentence" + i.toString()),
                page.click('#addFalseSentenceBTN')
            ]);
            await page.click("#FalseSentence" + i.toString());
            await page.type("#FalseSentence" + i.toString(), index.toString() + "_false");
        }

        await Promise.all([
            page.waitForNavigation(),
            page.click("#saveBTN"),
        ]);

        await page.waitForSelector("#LoginScreenHomePage")
        resolve("yes")
    });
}
var createRoom = function (page, index) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector("#LoginScreenHomePage")

        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#createNewRoomBTN')
        ]);

        await page.click("#roomName");
        await page.type("#roomName", "player " + index.toString() + "'s room");
        await Promise.all([
            page.waitForNavigation(),
            page.click('#startBTN')
        ]);
        await page.waitForSelector('#joinGamePage')

        await page.waitForSelector('#roomNameHeader')
        var room_number = await page.evaluate(() => document.getElementById('roomNumberHeader').textContent)

        //get the actual number from the string
        var number = room_number.substring(12)
        resolve(number)
    });
}
var joinRoom = function (page, room_number) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#LoginScreenHomePage')

        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#joinRoomBTN')
        ]);

        await page.click("#room_id");
        await page.type("#room_id", room_number);

        await Promise.all([
            page.waitForNavigation(),
            page.click('#startBTN')
        ]);
        await page.waitForSelector('#joinGamePage')
        resolve("yes")
    });
}
var inviteToMatch = function (page1, index1, page2, index2) {
    return new Promise(async function (resolve, reject) {
        console.log("invite to game- players " + index1.toString() + " and " + index2.toString())
        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')
        //await page1.reload()
        //await page1.waitForSelector('#joinGamePage')
        var success = false
        var times_to_try = 0
        while (!success) {
            times_to_try++
            success = true
            await page1.waitForSelector("#A" + index2.toString() + "InviteBTN").catch(() => success = false)
            if (!success) {
                console.log("bad messege: players " + index1.toString() + " and " + index2.toString())
                await page1.reload()
                await page1.waitForSelector('#joinGamePage')
            }
            if (times_to_try == 2) {
                resolve("bad")
            }
        }
        await Promise.all([
            page1.waitForSelector('#waitingForResponsePopUp'),
            page2.waitForSelector('#receivedInvitationPopUp'),
            page1.click("#A" + index2.toString() + "InviteBTN")
        ]);
        await Promise.all([
            page1.waitForNavigation(),
            page2.waitForNavigation(),
            page2.click("#acceptBTN")
        ]);

        console.log("start game- players " + index1.toString() + " and " + index2.toString())
        await page1.waitForSelector("#theGamePage");
        await page2.waitForSelector("#theGamePage");
        resolve("yes")
    });
}
var playMatch = function (page1, page2) {
    return new Promise(async function (resolve, reject) {
        await page1.waitForSelector("#theGamePage");
        await page2.waitForSelector("#theGamePage");

        var isPlayer1Turn = true;
        var is_enabled = await page1.$('#TrueBTN:not([disabled])') !== null;
        if (is_enabled) {
            isPlayer1Turn = true
        } else {
            isPlayer1Turn = false
        }

        //repeat until out of sentences
        var time_to_choose
        var choice;
        while (true) {
            time_to_choose = Math.floor(Math.random() * (MAX_TIME_TO_CHOOSE - MIN_TIME_TO_CHOOSE)) + MIN_TIME_TO_CHOOSE;
            choice = Math.random() >= 0.5; //randomize a boolean
            if (isPlayer1Turn) {
                await page1.waitFor(time_to_choose)
                is_enabled = await page1.$('#TrueBTN:not([disabled])') !== null;
                if (is_enabled) {
                    if (choice) {
                        await page1.click('#TrueBTN')
                    } else {
                        await page1.click('#FalseBTN')
                    }
                    await page1.waitForSelector("#NextSentenceBTN")
                    await page1.waitFor(MAX_TIME_TO_CHOOSE - time_to_choose + 1000)
                    await Promise.all([
                        page1.waitFor(() => !document.querySelector("#NextSentenceBTN")),
                        page1.click("#NextSentenceBTN")
                    ]);
                    isPlayer1Turn = false;
                    continue
                }
                break
            } else {
                await page2.waitFor(time_to_choose)
                is_enabled = await page2.$('#TrueBTN:not([disabled])') !== null;
                if (is_enabled) {
                    if (choice) {
                        await page2.click('#TrueBTN')
                    } else {
                        await page2.click('#FalseBTN')
                    }
                    await page2.waitForSelector("#NextSentenceBTN")
                    await page2.waitFor(MAX_TIME_TO_CHOOSE - time_to_choose + 1000)
                    await Promise.all([
                        page2.waitFor(() => !document.querySelector("#NextSentenceBTN")),
                        page2.click("#NextSentenceBTN")
                    ]);
                    isPlayer1Turn = true;
                    continue
                }
                break
            }
        }
        //exit and log out
        await page1.waitForSelector("#EndGameBTN1")
        await Promise.all([
            page1.waitForNavigation(),
            page2.waitForNavigation(),
            page1.click("#EndGameBTN1")
        ]);
        console.log("ended game")

        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')

        resolve("yes")
    });
}
var leaveRoom = function (page1, page2) {
    return new Promise(async function (resolve, reject) {
        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')

        await Promise.all([
            page1.waitForNavigation(),
            page2.waitForNavigation(),
            page1.click("#leaveRoomBTN"),
            page2.click("#leaveRoomBTN"),
        ]);

        await page1.waitForSelector("#LoginScreenHomePage")
        await page2.waitForSelector("#LoginScreenHomePage")
        resolve("yes")
    });
}
var logOut = function (page1, page2) {
    return new Promise(async function (resolve, reject) {
        await page1.waitForSelector("#LoginScreenHomePage")
        await page2.waitForSelector("#LoginScreenHomePage")

        await Promise.all([
            page1.waitForNavigation(),
            page2.waitForNavigation(),
            page1.click('#logOutBTN'),
            page2.click('#logOutBTN')
        ]);

        await page1.waitForSelector('#TrueAndFalseHomePage')
        await page2.waitForSelector('#TrueAndFalseHomePage')
        resolve("yes")
    });
}
var leaveRoom_single = function (page) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#joinGamePage')

        await Promise.all([
            page.waitForNavigation(),
            page.click("#leaveRoomBTN")
        ]);

        await page.waitForSelector("#LoginScreenHomePage")
        resolve("yes")
    });
}
var logOut_single = function (page) {
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector("#LoginScreenHomePage")

        await Promise.all([
            page.waitForNavigation(),
            page.click('#logOutBTN')
        ]);

        //await page.waitForSelector('#TrueAndFalseHomePage')
        resolve("yes")
    });
}

//phases
var firstPhase = function (page, index) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#TrueAndFalseHomePage')
        await page.waitFor(setback)
        if (INITIALIZE_PLAYERS) {
            await Promise.all([
                page.waitForNavigation(),
                page.click("#signUpBTN"),
            ]);
            await signUp(page, index)
            await fillSentences(page, index)
        } else {
            await Promise.all([
                page.waitForNavigation(),
                page.click("#signInBTN"),
            ]);
            await signIn(page, index)
        }
        await page.waitForSelector('#LoginScreenHomePage')
        resolve("yes")
    });
}
var secondPhase = function (page, index) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#LoginScreenHomePage')
        await page.waitFor(setback)
        var room_number = await createRoom(page, index)
        await page.waitForSelector('#joinGamePage')
        resolve({ player_id: index, room_number: room_number })
    });
}
var thirdPhase = function (page, index, room_number) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#LoginScreenHomePage')
        await page.waitFor(setback)
        await joinRoom(page, room_number)
        await page.waitForSelector('#joinGamePage')
        resolve("yes")
    });
}
var fourthPhase = function (page1, index1, page2, index2) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')
        var i
        for (i = 0; i < NUM_OF_MATCHES_PER_COUPLE; i++) {
            await page1.waitFor(setback)
            await inviteToMatch(page1, index1, page2, index2)
            await playMatch(page1, page2)
        }
        // await leaveRoom(page1, page2)
        // await logOut(page1, page2)
        // await page1.waitForSelector('#TrueAndFalseHomePage')
        // await page2.waitForSelector('#TrueAndFalseHomePage')

        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')
        resolve("yes")
    });
}
var fifthPhase = function (page, index) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#joinGamePage')

        await leaveRoom_single(page)
        //await logOut_single(page)
        await page.waitForSelector('#LoginScreenHomePage')

        resolve("yes")
    });
}
var sixthPhase = function (page, index) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#LoginScreenHomePage')

        //await leaveRoom_single(page)
        await logOut_single(page)
        //await page.waitForSelector('#TrueAndFalseHomePage')

        resolve("yes")
    });
}

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: HEADLESS,
        slowMo: TEST_SLOWDOWN,
        args: [`--window-size=${width},${height}`]
    });
});

afterAll(() => {
    browser.close();
});

describe("stress test", () => {
    test("all phases passed!", async () => {
        var i
        let context
        let prom
        let promises = []
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            pages.push({ page: page, id: i })
            //await page.emulate(iPhone);
            prom = page.setViewport({ width, height });
            promises.push(prom)
            prom = page.goto(APP);
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("all tabs opened")
        await page.waitFor(TIME_BETWEEN_PHASES)

        promises = []
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = firstPhase(page, i)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("first phase completed")
        await page.waitFor(TIME_BETWEEN_PHASES)

        let rooms = []
        promises = []
        for (i = 0; i < NUM_OF_ROOMS; i++) {
            page = pages[i].page
            prom = secondPhase(page, i)
            promises.push(prom)
        }
        let room_numbers_array = await Promise.all(promises);
        for (i = 0; i < NUM_OF_ROOMS; i++) {
            const player_id = room_numbers_array[i].player_id
            rooms.push([player_id])
        }
        console.log("second phase completed")
        await page.waitFor(TIME_BETWEEN_PHASES)

        promises = []
        for (i = NUM_OF_ROOMS; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = thirdPhase(page, i, room_numbers_array[i % NUM_OF_ROOMS].room_number)
            promises.push(prom)
            rooms[i % NUM_OF_ROOMS].push(i)
        }
        await Promise.all(promises);
        console.log("third phase completed")
        await page.waitFor(TIME_BETWEEN_PHASES)
        //console.log(rooms)

        promises = []
        let page1
        let page2
        var player1_id
        var player2_id
        let players_in_room
        for (i = 0; i < NUM_OF_ROOMS; i++) {
            players_in_room = rooms[i]
            while (players_in_room.length > 1) {
                player1_id = GetRandomElement(players_in_room, true)
                player2_id = GetRandomElement(players_in_room, true)
                //console.log(player1_id.toString() + " and " + player2_id.toString())
            }
            page1 = pages[player1_id].page
            page2 = pages[player2_id].page
            prom = fourthPhase(page1, player1_id, page2, player2_id)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("fourth phase completed")
        await page1.waitFor(TIME_BETWEEN_PHASES)

        promises = []
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = fifthPhase(page, i)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("fifth phase completed")
        await page.waitFor(TIME_BETWEEN_PHASES)

        promises = []
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = sixthPhase(page, i)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("sixth phase completed")
    }, 30000000);
});

// for (i = 0; i < NUM_OF_PLAYERS; i++){
        //     page = pages[i].page
        //     await page.screenshot({path: i.toString() + "test_img.png"});
        // }