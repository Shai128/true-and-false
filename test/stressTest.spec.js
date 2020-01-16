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
const NUM_OF_PLAYERS = 4
const NUM_OF_ROOMS = 2
const NUM_OF_TRUE_SENTENCES = 2
const NUM_OF_FALSE_SENTENCES = 2
const MAX_SETBACK = 2000

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
        resolve(room_number)
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

describe("signInAndSignUp", () => {
    test("succesful first phase", async () => {
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
        promises = []
        for (i = 0; i < NUM_OF_ROOMS; i++) {
            page = pages[i].page
            prom = secondPhase(page, i)
            promises.push(prom)
        }
        let room_numbers_array = await Promise.all(promises);
        console.log("second phase completed")


        promises = []
        for (i = NUM_OF_ROOMS; i < NUM_OF_PLAYERS; i++) {
            page = pages[i].page
            prom = thirdPhase(page, i, room_numbers_array[i%NUM_OF_ROOMS])
            promises.push(prom)
        }
        await Promise.all(promises);
        console.log("third phase completed")
        for (i = 0; i < NUM_OF_PLAYERS; i++){
            page = pages[i].page
            await page.screenshot({path: i.toString() + "after_join.png"});
        }




    }, 300000);
});