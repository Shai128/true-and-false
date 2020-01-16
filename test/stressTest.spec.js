import faker from "faker";
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
const homePage = "http://localhost:3000/LoginScreen/Home"
import 'babel-polyfill';
const iPhone = puppeteer.devices['iPhone 6'];

let pages = []
let page;
let browser;
const width = 1000;
const height = 600;
const pass = "000000"

//test parameters
const NUM_OF_PLAYERS = 4
const NUM_OF_ROOMS = 2
const NUM_OF_TRUE_SENTENCES = 2
const NUM_OF_FALSE_SENTENCES = 2
const MAX_SETBACK = 3000 //[seconds/1000]
const MIN_TIME_TO_CHOOSE = 500 //[seconds/1000]
const MAX_TIME_TO_CHOOSE = 2000 //[seconds/1000]

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
        await page1.waitForSelector('#joinGamePage')
        await page2.waitForSelector('#joinGamePage')
        await page1.waitForSelector("#A" + index2.toString() + "InviteBTN")

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
                    await page1.waitFor(MAX_TIME_TO_CHOOSE - time_to_choose)
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
                    await page2.waitFor(MAX_TIME_TO_CHOOSE - time_to_choose)
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
var firstPhase = function (page, index) {
    var setback = Math.floor(Math.random() * MAX_SETBACK);
    return new Promise(async function (resolve, reject) {
        await page.waitForSelector('#TrueAndFalseHomePage')
        await page.waitFor(setback)
        // await Promise.all([
        //     page.waitForNavigation(),
        //     page.click("#signUpBTN"),
        // ]);
        // await signUp(page, index)
        // await fillSentences(page, index)
        await Promise.all([
            page.waitForNavigation(),
            page.click("#signInBTN"),
        ]);
        await signIn(page, index)
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
        await page1.waitFor(setback)

        await inviteToMatch(page1, index1, page2, index2)
        await playMatch(page1, page2)
        await leaveRoom(page1, page2)
        await logOut(page1, page2)

        await page1.waitForSelector('#TrueAndFalseHomePage')
        await page2.waitForSelector('#TrueAndFalseHomePage')
        resolve("yes")
    });
}

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 40,
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
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            pages.push({ page: page, id: i })
            //await page.emulate(iPhone);
            await page.setViewport({ width, height });
            await page.goto(APP);
        }

        await page.waitFor(1000)
        let prom
        let promises = []
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = firstPhase(page, i)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("first phase completed")
        await page.waitFor(1000)

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

        promises = []
        for (i = NUM_OF_ROOMS; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = thirdPhase(page, i, room_numbers_array[i % NUM_OF_ROOMS].room_number)
            promises.push(prom)
            rooms[i % NUM_OF_ROOMS].push(i)
        }
        await Promise.all(promises);
        console.log("third phase completed")
        console.log(rooms)

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
                console.log(player1_id.toString() + " and " + player2_id.toString())
            }

            page1 = pages[player1_id].page
            page2 = pages[player2_id].page
            prom = fourthPhase(page1, player1_id, page2, player2_id)
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("fourth phase completed")
    }, 3000000);
});

// for (i = 0; i < NUM_OF_PLAYERS; i++){
        //     page = pages[i].page
        //     await page.screenshot({path: i.toString() + "test_img.png"});
        // }