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

const width = 1920;
const height = 1080;


const player1 = {
    name: faker.name.firstName(),
    nickname: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    trueSentences: [faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 }))],
    falseSentences: [faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 }))]
};
const player2 = {
    name: faker.name.firstName(),
    nickname: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    trueSentences: [faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 }))],
    falseSentences: [faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 })), faker.random.words(faker.random.number({ min: 2, max: 5 }))]
};

beforeAll(async () => {

    browser = await puppeteer.launch({
        headless: false,
        slowMo: 30,
        args: [`--window-size=${width},${height}`]
    });

    // Create a new incognito browser context
    //const context = await browser.createIncognitoBrowserContext();
    // Create a new page inside context.
    const context1 = await browser.createIncognitoBrowserContext();
    page = await context1.newPage();

    //page = await browser.newPage();

    //page = await browser.newPage();
    //await page.emulate(iPhone);
    await page.setViewport({ width, height });

    await page.goto(APP);
    await page.waitForSelector('#TrueAndFalseHomePage')

    const context2 = await browser.createIncognitoBrowserContext();
    page2 = await context2.newPage();

    //page = await browser.newPage();

    //page = await browser.newPage();
    //await page.emulate(iPhone);
    await page2.setViewport({ width, height });

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

}, 700000);

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
        await Promise.all([
            page.waitForSelector("#TrueSentence1"),
            page.click('#addTrueSentenceBTN')
        ]);
        await page.click("#TrueSentence1");
        await page.type("#TrueSentence1", player1.trueSentences[1]);
        await Promise.all([
            page.waitForSelector("#TrueSentence2"),
            page.click('#addTrueSentenceBTN')
        ]);
        await page.click("#TrueSentence2");
        await page.type("#TrueSentence2", player1.trueSentences[2]);

        //fill in player1 false sentences
        await Promise.all([
            page.waitForSelector("#FalseSentence0"),
            page.click('#addFalseSentenceBTN')
        ]);
        await page.click("#FalseSentence0");
        await page.type("#FalseSentence0", player1.falseSentences[0]);
        await Promise.all([
            page.waitForSelector("#FalseSentence1"),
            page.click('#addFalseSentenceBTN')
        ]);
        await page.click("#FalseSentence1");
        await page.type("#FalseSentence1", player1.falseSentences[1]);
        await Promise.all([
            page.waitForSelector("#FalseSentence2"),
            page.click('#addFalseSentenceBTN')
        ]);
        await page.click("#FalseSentence2");
        await page.type("#FalseSentence2", player1.falseSentences[2]);


        //fill in player2 true sentences
        await Promise.all([
            page2.waitForSelector("#TrueSentence0"),
            page2.click('#addTrueSentenceBTN')
        ]);
        await page2.click("#TrueSentence0");
        await page2.type("#TrueSentence0", player2.trueSentences[0]);
        await Promise.all([
            page2.waitForSelector("#TrueSentence1"),
            page2.click('#addTrueSentenceBTN')
        ]);
        await page2.click("#TrueSentence1");
        await page2.type("#TrueSentence1", player2.trueSentences[1]);
        await Promise.all([
            page2.waitForSelector("#TrueSentence2"),
            page2.click('#addTrueSentenceBTN')
        ]);
        await page2.click("#TrueSentence2");
        await page2.type("#TrueSentence2", player2.trueSentences[2]);

        //fill in player2 false sentences
        await Promise.all([
            page2.waitForSelector("#FalseSentence0"),
            page2.click('#addFalseSentenceBTN')
        ]);
        await page2.click("#FalseSentence0");
        await page2.type("#FalseSentence0", player2.falseSentences[0]);
        await Promise.all([
            page2.waitForSelector("#FalseSentence1"),
            page2.click('#addFalseSentenceBTN')
        ]);
        await page2.click("#FalseSentence1");
        await page2.type("#FalseSentence1", player2.falseSentences[1]);
        await Promise.all([
            page2.waitForSelector("#FalseSentence2"),
            page2.click('#addFalseSentenceBTN')
        ]);
        await page2.click("#FalseSentence2");
        await page2.type("#FalseSentence2", player2.falseSentences[2]);

        await page.click("#saveBTN");
        await page2.click("#saveBTN");
        await page.waitFor(1000)

        //check that the sentences were saved (only for player1)
        await Promise.all([
            page.waitForNavigation(),
            page.click('#homeBTN')
        ]);
        await page.waitForSelector("#LoginScreenHomePage")
        await Promise.all([
            page.waitForNavigation(),
            page.click('#mySentencesBTN')
        ]);
        await page.waitForSelector("#MySentencesPage")

        var someText = await page.evaluate(() => document.getElementById('TrueSentence0').textContent)
        expect(someText).toEqual(`${player1.trueSentences[0]}`);
        someText = await page.evaluate(() => document.getElementById('FalseSentence2').textContent)
        expect(someText).toEqual(`${player1.falseSentences[2]}`);

    }, 700000);

    test("successfull invitation", async () => {
        //open a room with player1
        await Promise.all([
            page.waitForNavigation(),
            page.click('#homeBTN')
        ]);

        expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy()//redirect to home page
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
        await Promise.all([
            page2.waitForNavigation(),
            page2.click('#homeBTN')
        ]);
        expect(page2.url() === APP + "LoginScreen/Home" || page2.url() === APP + "LoginScreen").toBeTruthy();//redirect to home page
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
        await Promise.all([
            page.waitForNavigation(),
            page2.waitForNavigation(),
            page.click("#acceptBTN")
        ]);

        await page.waitForSelector("#theGamePage");
        await page2.waitForSelector("#theGamePage");

    }, 700000);

    test("successfull match", async () => {
        //check that the opponent's name is correct
        var someText = await page.evaluate(() => document.getElementById('opponentName').textContent)
        expect(someText).toEqual(`Playing against ${player2.nickname}`);//correct nickname
        someText = await page2.evaluate(() => document.getElementById('opponentName').textContent)
        expect(someText).toEqual(`Playing against ${player1.nickname}`);//correct nickname

        //see who is first
        var isPlayer1Turn;
        try {
            await page.waitForSelector('#trueBTN', { timeout: 2000 }); //this thing might be flaky. Not sure it is a good idea!!!
            isPlayer1Turn = true
        } catch (e) {
            await page2.waitForSelector('#trueBTN', { timeout: 2000 }); //just to make sure
            isPlayer1Turn = false
        }

        //repeat until out of sentences
        var choice;
        var outOfsentences = false
        while (!outOfsentences) {
            choice = Math.random() >= 0.5; //randomize a boolean
            try {
                if(isPlayer1Turn){
                    await page.waitForSelector('#trueBTN', { timeout: 2000 })
                    if (choice) {
                        await page.click('#TrueBTN')
                    } else {
                        await page.click('#FalseBTN')
                    }
                    await page.waitForSelector("#NextSentenceBTN")
                    await Promise.all([
                        page.waitFor(() => !document.querySelector("#TrueBTN")),
                        page.click("#NextSentenceBTN")
                    ]);
                    isPlayer1Turn = false;
                } else {
                    await page2.waitForSelector('#trueBTN', { timeout: 2000 })
                    if (choice) {
                        await page2.click('#TrueBTN')
                    } else {
                        await page2.click('#FalseBTN')
                    }
                    await page2.waitForSelector("#NextSentenceBTN")
                    await Promise.all([
                        page2.waitFor(() => !document.querySelector("#TrueBTN")),
                        page2.click("#NextSentenceBTN")
                    ]);
                    isPlayer1Turn = true;
                }
            } catch (e) {
                outOfsentences = true
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