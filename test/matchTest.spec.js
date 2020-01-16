var faker = require('faker/locale/en_US');
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
const homePage = "http://localhost:3000/LoginScreen/Home"
import 'babel-polyfill';
const iPhone = puppeteer.devices['iPhone 6'];

let page;
let page2;
let browser;

let player2_trueSentences
let player2_falseSentences

const width = 1000;
const height = 1080;


const player1 = {
    name: faker.name.firstName(),
    nickname: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    trueSentences: [faker.random.words(faker.random.number({ min: 2, max: 4 })), faker.random.words(faker.random.number({ min: 2, max: 4 }))],
    falseSentences: [faker.random.words(faker.random.number({ min: 2, max: 4 })), faker.random.words(faker.random.number({ min: 2, max: 4 }))]
};
const player2 = {
    name: faker.name.firstName(),
    nickname: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    trueSentences: [faker.random.words(faker.random.number({ min: 2, max: 4 })), faker.random.words(faker.random.number({ min: 2, max: 4 }))],
    falseSentences: [faker.random.words(faker.random.number({ min: 2, max: 4 })), faker.random.words(faker.random.number({ min: 2, max: 4 }))]
};

beforeAll(async () => {

    browser = await puppeteer.launch({
        headless: false,
        slowMo: 20,
        args: [`--window-size=${width},${height}`]
    });

    // Create a new incognito browser context
    //const context = await browser.createIncognitoBrowserContext();
    // Create a new page inside context.
    const context1 = await browser.createIncognitoBrowserContext();
    page = await context1.newPage();

    //page = await browser.newPage();

    //page = await browser.newPage();
    await page.emulate(iPhone);
    //await page.setViewport({ width, height });

    await page.goto(APP);
    await page.waitForSelector('#TrueAndFalseHomePage')

    const context2 = await browser.createIncognitoBrowserContext();
    page2 = await context2.newPage();

    //page = await browser.newPage();

    //page = await browser.newPage();
    await page2.emulate(iPhone);
    //await page2.setViewport({ width, height });

    await page2.goto(APP);
    await page2.waitForSelector('#TrueAndFalseHomePage')
    await Promise.all([
        page.waitForNavigation(),
        page.click('#signUpBTN')
    ]);
    await page.waitForSelector('#SignUpPage')

    expect(page.url()).toEqual(APP + "SignUp")//redirect to signUp page
    await page.click("#firstName");
    await page.type("#firstName", player1.name);
    await page.click("#nickName");
    await page.type("#nickName", player1.nickname);
    await page.click("#email");
    await page.type("#email", player1.email);
    await page.click("#password");
    await page.type("#password", player1.password);
    await page.click("#confirmPassword");
    await page.type("#confirmPassword", player1.password);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#submit')
    ]);

    expect(page.url()).toEqual(APP + "LoginScreen/MySentences")//redirect to personal info page
    await page.waitForSelector('#MySentencesPage')

    //player2 signUp
    await Promise.all([
        page2.waitForNavigation(),
        page2.click('#signUpBTN')
    ]);
    await page2.waitForSelector('#SignUpPage')

    expect(page2.url()).toEqual(APP + "SignUp")//redirect to signUp page
    await page2.click("#firstName");
    await page2.type("#firstName", player2.name);
    await page2.click("#nickName");
    await page2.type("#nickName", player2.nickname);
    await page2.click("#email");
    await page2.type("#email", player2.email);
    await page2.click("#password");
    await page2.type("#password", player2.password);
    await page2.click("#confirmPassword");
    await page2.type("#confirmPassword", player2.password);
    await Promise.all([
        page2.waitForNavigation(),
        page2.click('#submit')
    ]);

    expect(page2.url()).toEqual(APP + "LoginScreen/MySentences")//redirect to personal info page
    await page2.waitForSelector('#MySentencesPage')

}, 7000000);

afterAll(async () => {
    await page.waitForSelector('#logOutBTN')
    await Promise.all([
        page.waitForNavigation(),
        page.click('#logOutBTN')
    ]);
    await page.waitForSelector('#TrueAndFalseHomePage')

    await page2.waitForSelector('#logOutBTN')
    await Promise.all([
        page2.waitForNavigation(),
        page2.click('#logOutBTN')
    ]);
    await page2.waitForSelector('#TrueAndFalseHomePage')
    browser.close();
});

describe("matchTest", () => {

    test("successfull fill in sentences", async () => {
        //fill in player1 true sentences
        await Promise.all([
            page.waitForSelector("#TrueSentence0"),
            page.click('#addTrueSentenceBTN')
        ]);
        await page.click("#TrueSentence0");
        await page.type("#TrueSentence0", player1.trueSentences[0]);
        // await Promise.all([
        //     page.waitForSelector("#TrueSentence1"),
        //     page.click('#addTrueSentenceBTN')
        // ]);
        // await page.click("#TrueSentence1");
        // await page.type("#TrueSentence1", player1.trueSentences[1]);
        // await Promise.all([
        //     page.waitForSelector("#TrueSentence2"),
        //     page.click('#addTrueSentenceBTN')
        // ]);
        // await page.click("#TrueSentence2");
        // await page.type("#TrueSentence2", player1.trueSentences[2]);

        //fill in player1 false sentences
        await Promise.all([
            page.waitForSelector("#FalseSentence0"),
            page.click('#addFalseSentenceBTN')
        ]);
        await page.click("#FalseSentence0");
        await page.type("#FalseSentence0", player1.falseSentences[0]);
        // await Promise.all([
        //     page.waitForSelector("#FalseSentence1"),
        //     page.click('#addFalseSentenceBTN')
        // ]);
        // await page.click("#FalseSentence1");
        // await page.type("#FalseSentence1", player1.falseSentences[1]);
        // await Promise.all([
        //     page.waitForSelector("#FalseSentence2"),
        //     page.click('#addFalseSentenceBTN')
        // ]);
        // await page.click("#FalseSentence2");
        // await page.type("#FalseSentence2", player1.falseSentences[2]);


        //fill in player2 true sentences
        await Promise.all([
            page2.waitForSelector("#TrueSentence0"),
            page2.click('#addTrueSentenceBTN')
        ]);
        await page2.click("#TrueSentence0");
        await page2.type("#TrueSentence0", player2.trueSentences[0]);
        // await Promise.all([
        //     page2.waitForSelector("#TrueSentence1"),
        //     page2.click('#addTrueSentenceBTN')
        // ]);
        // await page2.click("#TrueSentence1");
        // await page2.type("#TrueSentence1", player2.trueSentences[1]);
        // await Promise.all([
        //     page2.waitForSelector("#TrueSentence2"),
        //     page2.click('#addTrueSentenceBTN')
        // ]);
        // await page2.click("#TrueSentence2");
        // await page2.type("#TrueSentence2", player2.trueSentences[2]);

        //fill in player2 false sentences
        await Promise.all([
            page2.waitForSelector("#FalseSentence0"),
            page2.click('#addFalseSentenceBTN')
        ]);
        await page2.click("#FalseSentence0");
        await page2.type("#FalseSentence0", player2.falseSentences[0]);
        // await Promise.all([
        //     page2.waitForSelector("#FalseSentence1"),
        //     page2.click('#addFalseSentenceBTN')
        // ]);
        // await page2.click("#FalseSentence1");
        // await page2.type("#FalseSentence1", player2.falseSentences[1]);
        // await Promise.all([
        //     page2.waitForSelector("#FalseSentence2"),
        //     page2.click('#addFalseSentenceBTN')
        // ]);
        // await page2.click("#FalseSentence2");
        // await page2.type("#FalseSentence2", player2.falseSentences[2]);

        await Promise.all([
            page.waitForNavigation(),
            page.click("#saveBTN"),
            page2.waitForNavigation(),
            page2.click("#saveBTN")
        ]);

        await page.waitForSelector("#LoginScreenHomePage")
        await page2.waitForSelector("#LoginScreenHomePage")

        // //check that the sentences were saved (only for player1)
        // await Promise.all([
        //     page.waitForNavigation(),
        //     page.click('#mySentencesBTN')
        // ]);
        // await page.waitForSelector("#MySentencesPage")

        // await page.waitForSelector("#TrueSentence0")
        // await page.waitForSelector("#FalseSentence2")

        // await page.screenshot({path: 'puppeteerTests/example.png'});

        // var someText = await page.evaluate(() => document.getElementById('TrueSentence0').textContent)
        // expect(someText).toBe(`${player1.trueSentences[0]}`);
        // someText = await page.evaluate(() => document.getElementById('FalseSentence2').textContent)
        // expect(someText).toBe(`${player1.falseSentences[2]}`);

    }, 700000);

    test("successfull join room", async () => {
        //open a room with player1
        // await Promise.all([
        //     page.waitForNavigation(),
        //     page.click('#homeBTN')
        // ]);

        // expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy()//redirect to home page
        await page.waitForSelector("#LoginScreenHomePage")

        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#createNewRoomBTN')
        ]);

        const room = {
            name: faker.name.title(),
        };
        await page.click("#roomName");
        await page.type("#roomName", room.name);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#startBTN')
        ]);
        expect(page.url() === APP + "LoginScreen/JoinGame" || page2.url() === APP + "JoinGame").toBeTruthy();//redirect to room page
        await page.waitForSelector('#joinGamePage')

        await page.waitForSelector('#roomNameHeader')
        var roomNumber = await page.evaluate(() => document.getElementById('roomNumberHeader').textContent)

        //get the actual number from the string
        var number = roomNumber.substring(12)

        //go with the second account to the home page
        // await Promise.all([
        //     page2.waitForNavigation(),
        //     page2.click('#homeBTN')
        // ]);
        // expect(page2.url() === APP + "LoginScreen/Home" || page2.url() === APP + "LoginScreen").toBeTruthy();//redirect to home page
        await page2.waitForSelector('#LoginScreenHomePage')

        //join a room
        await Promise.all([
            page2.waitForSelector('#openRoomPopUp'),
            page2.click('#joinRoomBTN')
        ]);

        await page2.click("#room_id");
        await page2.type("#room_id", number);

        await Promise.all([
            page2.waitForNavigation(),
            page2.click('#startBTN')
        ]);
        expect(page2.url() === APP + "LoginScreen/JoinGame" || page2.url() === APP + "JoinGame").toBeTruthy();//redirect to room page
        await page2.waitForSelector('#joinGamePage')

    }, 700000);

    // test("successfull chat routine", async () => {
    //     //player1 sends player2 a message
    //     await page.waitForSelector("#" + player2.nickname + "Available" + "ChatBTN")

    //     await Promise.all([
    //         page.waitForNavigation(),
    //         page.click("#" + player2.nickname + "Available" + "ChatBTN")
    //     ]);
    //     await page.waitForSelector('#chatPage')

    //     var friends_email = await page.evaluate(() => document.getElementById('email').textContent)
    //     expect(friends_email).toBe(player2.email)

    //     await page.click("#message");
    //     await page.type("#message", "Hi!");
    //     await page.click("#sendBTN");

    //     //player2 enters the chat page
    //     console.log("W1")
    //     //await page2.waitForSelector("#1notifications")
    //     await page2.waitFor(1000);
    //     console.log("W2")
    //     await Promise.all([
    //         page2.waitForSelector("#notificationsPopUp"),
    //         page2.click("#notificationsBTN")
    //     ]);
    //     console.log("W3")
    //     await Promise.all([
    //         page2.waitForNavigation(),
    //         page2.click("#message1")
    //     ]);
    //     await page2.waitForSelector('#chatPage')
    //     //await page2.waitForSelector("#MSG:" + "Hi!")

    //     friends_email = await page2.evaluate(() => document.getElementById('email').textContent)
    //     expect(friends_email).toBe(player1.email)

    //     //player1 and player2 talk
    //     await page2.click("#message");
    //     await page2.type("#message", "My mom says i shouldn't talk to strangers...");
    //     await Promise.all([
    //         //page.waitForSelector("#MSG:" + "My "),
    //         page2.click("#sendBTN")
    //     ]);

    //     await page.click("#message");
    //     await page.type("#message", "so let's get to know each other by playing a game!");
    //     await Promise.all([
    //         //page2.waitForSelector("#MSG:" + "so "),
    //         page.click("#sendBTN")
    //     ]);

    //     await page2.click("#message");
    //     await page2.type("#message", "OK!, let's go!");
    //     await Promise.all([
    //         //page.waitForSelector("#MSG:" + "OK!"),
    //         page2.click("#sendBTN")
    //     ]);

    //     //both players return to room
    //     await Promise.all([
    //         //page.waitForSelector("#MSG:" + "OK!"),
    //         page.waitForNavigation(),
    //         page.click("#backToRoomBTN"),
    //         page2.waitForNavigation(),
    //         page2.click("#backToRoomBTN")
    //     ]);
    //     expect(page.url() === APP + "LoginScreen/JoinGame" || page2.url() === APP + "JoinGame").toBeTruthy();//redirect to room page
    //     expect(page2.url() === APP + "LoginScreen/JoinGame" || page2.url() === APP + "JoinGame").toBeTruthy();//redirect to room page
    //     await page.waitForSelector('#joinGamePage')
    //     await page2.waitForSelector('#joinGamePage')
    //     await page.waitFor(5000)
    // }, 700000);

    test("successfull match invitation", async () => {
        await page.waitForSelector("#" + player2.nickname + "InviteBTN")
        await page2.waitForSelector("#" + player1.nickname + "InviteBTN")

        //player1 invites player2 and cancels it
        await Promise.all([
            page.waitForSelector('#waitingForResponsePopUp'),
            page2.waitForSelector('#receivedInvitationPopUp'),
            page.click("#" + player2.nickname + "InviteBTN")
        ]);
        await Promise.all([
            page.waitFor(() => !document.querySelector("#waitingForResponsePopUp")),
            page2.waitFor(() => !document.querySelector("#receivedInvitationPopUp")),
            page.click("#cancelBTN")
        ]);

        //player1 invites player2 and player2 declines
        await Promise.all([
            page.waitForSelector('#waitingForResponsePopUp'),
            page2.waitForSelector('#receivedInvitationPopUp'),
            page.click("#" + player2.nickname + "InviteBTN")
        ]);
        await Promise.all([
            page.waitFor(() => !document.querySelector("#waitingForResponsePopUp")),
            page2.waitFor(() => !document.querySelector("#receivedInvitationPopUp")),
            page2.click("#declineBTN")
        ]);

        //player2 invites player1 and player1 accepts
        await Promise.all([
            page2.waitForSelector('#waitingForResponsePopUp'),
            page.waitForSelector('#receivedInvitationPopUp'),
            page2.click("#" + player1.nickname + "InviteBTN")
        ]);
        console.log("pls")
        await Promise.all([
            page.waitForNavigation(),
            page2.waitForNavigation(),
            page.click("#acceptBTN")
        ]);
        console.log("got here")

        await page.waitForSelector("#theGamePage");
        await page2.waitForSelector("#theGamePage");

    }, 700000);

    test("successfull match", async () => {
        console.log("got here1")
        await page.screenshot({path: 'the_game.png'});
        //check that the opponent's name is correct
        var someText = await page.evaluate(() => document.getElementById('opponentName').textContent)
        expect(someText).toEqual(`Playing against ${player2.nickname}`);//correct nickname
        someText = await page2.evaluate(() => document.getElementById('opponentName').textContent)
        expect(someText).toEqual(`Playing against ${player1.nickname}`);//correct nickname

        //see who is first
        var isPlayer1Turn = true;
        console.log("got here2")



        var is_enabled = await page.$('#TrueBTN:not([disabled])') !== null;
        console.log("is enabled1:" + is_enabled)
        if (is_enabled) {
            isPlayer1Turn = true
        } else {
            isPlayer1Turn = false
        }

        //repeat until out of sentences
        var choice;
        while (true) {
            choice = Math.random() >= 0.5; //randomize a boolean
            console.log("got to the while")
            if (isPlayer1Turn) {
                console.log("player1 plays")
                await page.waitFor(500)
                is_enabled = await page.$('#TrueBTN:not([disabled])') !== null;
                if (is_enabled) {
                    if (choice) {
                        await page.click('#TrueBTN')
                    } else {
                        await page.click('#FalseBTN')
                    }
                    console.log("player1 chose")
                    await page.waitForSelector("#NextSentenceBTN")
                    console.log("player1 found next")
                    await page.waitFor(500)
                    await Promise.all([
                        page.waitFor(() => !document.querySelector("#NextSentenceBTN")),
                        page.click("#NextSentenceBTN")
                    ]);
                    console.log("player1 finished")
                    isPlayer1Turn = false;
                    continue
                }
                break
            } else {
                console.log("player2 plays")
                await page2.waitFor(500)
                is_enabled = await page2.$('#TrueBTN:not([disabled])') !== null;
                if (is_enabled) {
                    if (choice) {
                        await page2.click('#TrueBTN')
                    } else {
                        await page2.click('#FalseBTN')
                    }
                    console.log("player2 chose")
                    await page2.waitForSelector("#NextSentenceBTN")
                    console.log("player2 found next")
                    await page2.waitFor(500)
                    await Promise.all([
                        page2.waitFor(() => !document.querySelector("#NextSentenceBTN")),
                        page2.click("#NextSentenceBTN")
                    ]);
                    console.log("player2 finished")

                    isPlayer1Turn = true;
                    continue
                }
                break
            }
        }
        //exit and log out
        await page.waitForSelector("#EndGameBTN1") //not sure if this is the correct id
        await Promise.all([
            page.waitForNavigation(),
            page2.waitForNavigation(),
            page.click("#EndGameBTN1")
        ]);
        await page.waitForSelector("#joinGamePage")
        await page2.waitForSelector("#joinGamePage")

        await page.screenshot({ path: 'puppeteerTests/example.png' });
        await page2.screenshot({ path: 'puppeteerTests/example1.png' });


        await page.waitFor(500)
        await page2.waitFor(500)
        await page.screenshot({ path: 'puppeteerTests/example2.png' });
        await page2.screenshot({ path: 'puppeteerTests/example3.png' });

        await Promise.all([
            page.waitForNavigation(),
            page2.waitForNavigation(),
            page.click("#leaveRoomBTN"),
            page2.click("#leaveRoomBTN"),
        ]);

        await page.waitForSelector("#LoginScreenHomePage")
        await page2.waitForSelector("#LoginScreenHomePage")


    }, 700000);

});