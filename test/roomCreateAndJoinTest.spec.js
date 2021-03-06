import faker from "faker";
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
const homePage = "http://localhost:3000/LoginScreen/Home"
import 'babel-polyfill';
const iPhone = puppeteer.devices['iPhone 6'];

let page;
let page2;
let browser;
const width = 1920;
const height = 1080;


const lead = {
    name: faker.name.firstName(),
    nickname: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10)
};

beforeEach(async () => {
    var HTMLelement;
    await page.goto(APP);
    await page.waitForSelector('#TrueAndFalseHomePage')

    await Promise.all([
        page.waitForNavigation(),
        page.click('#signInBTN')
    ]);
    expect(page.url()).toEqual(APP + "SignIn")//redirect to signIn page
    await page.waitForSelector('#SignInPage')

    await page.click("#EmailInput");
    await page.type("#EmailInput", lead.email);
    await page.click("#PasswordInput");
    await page.type("#PasswordInput", lead.password);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#submit')
    ]);

    expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy()//redirect to home page
    await page.waitForSelector("#LoginScreenHomePage")

}, 700000);

afterEach(async () => {
    var HTMLelement;
    await page.waitForSelector('#logOutBTN')
    await Promise.all([
        page.waitForNavigation(),
        page.click('#logOutBTN')
    ]);
    await page.waitForSelector('#TrueAndFalseHomePage')

}, 700000);

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

    await Promise.all([
        page.waitForNavigation(),
        page.click('#signUpBTN')
    ]);
    await page.waitForSelector('#SignUpPage')

    expect(page.url()).toEqual(APP + "SignUp")//redirect to signUp page
    await page.click("#firstName");
    await page.type("#firstName", lead.name);
    await page.click("#nickName");
    await page.type("#nickName", lead.nickname);
    await page.click("#email");
    await page.type("#email", lead.email);
    await page.click("#password");
    await page.type("#password", lead.password);
    await page.click("#confirmPassword");
    await page.type("#confirmPassword", lead.password);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#submit')
    ]);

    expect(page.url()).toEqual(APP + "LoginScreen/MySentences")//redirect to personal info page
    await page.waitForSelector('#MySentencesPage')
    await page.waitForSelector('#logOutBTN')
    await Promise.all([
        page.waitForNavigation(),
        page.click('#logOutBTN')
    ]);
    await page.waitForSelector('#TrueAndFalseHomePage')


}, 700000);

afterAll(() => {
    browser.close();
});

describe("roomCreateAndJoinTest", () => {

    test("successfull roomCreation", async () => {
        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#createNewRoomBTN')
        ]);

        await Promise.all([
            page.waitFor(() => !document.querySelector("#openRoomPopUp")),
            page.click("#cancelBTN")
        ]);

        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#createNewRoomBTN')
        ]);

        const room = {
            name: faker.name.title(),
            nickname: faker.name.firstName(),
        };

        await page.click("#roomName");
        await page.type("#roomName", room.name);

        // await page.focus("#nickName");
        // const inputValue = await page.$eval('#nickName', el => el.value);
        // for (let i = 0; i < inputValue.length; i++) {
        //     await page.keyboard.press('Backspace');
        // }
        // await page.click("#nickName");
        // await page.type("#nickName", room.nickname);

        await Promise.all([
            page.waitForNavigation(),
            page.click('#startBTN')
        ]);

        await page.waitForSelector('#joinGamePage')
        expect(page.url() === APP + "LoginScreen/JoinGame" || page.url() === APP + "JoinGame").toBeTruthy()//redirect to home page

        await page.waitForSelector('#roomNameHeader')
        var someText = await page.evaluate(() => document.getElementById('roomNameHeader').textContent)
        expect(someText).toEqual(`Room Name:${room.name}`);//correct room name
        someText = await page.evaluate(() => document.getElementById('userNameHeader').textContent)
        expect(someText).toEqual(`User Name:${lead.nickname}`);//correct nickname
        await Promise.all([
            page.waitForNavigation(),
            page.click('#leaveRoomBTN')
        ]);
        expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy()//redirect to home page
        await page.waitForSelector('#LoginScreenHomePage')
    }, 30000);

    // test("failed roomCreation", async () => {
    //     await page.screenshot({path: 'puppeteerTests/example.png'});

    //     await Promise.all([
    //         page.waitForSelector('#openRoomPopUp'),
    //         page.click('#createNewRoomBTN')
    //     ]);

    //     await page.click('#startBTN')
    //     //await page.waitForSelector('#openRoomPopUp')//stay in same page

    // }, 30000);

    test("successful join a room", async () => {

        //open new context and page
        const context = await browser.createIncognitoBrowserContext();
        page2 = await context.newPage();
        //await page2.emulate(iPhone);
        await page2.setViewport({ width, height });

        //randomize a second player
        const secondUser = {
            name: faker.name.firstName(),
            nickname: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.random.alphaNumeric(10)
        };

        //sign the new player up
        await page2.goto(APP);
        await page2.waitForSelector('#TrueAndFalseHomePage')

        await Promise.all([
            page2.waitForNavigation(),
            page2.click('#signUpBTN')
        ]);
        expect(page2.url()).toEqual(APP + "SignUp")//redirect to signUp page
        await page2.waitForSelector('#SignUpPage')

        await page2.click("#firstName");
        await page2.type("#firstName", secondUser.name);
        await page2.click("#nickName");
        await page2.type("#nickName", secondUser.nickname);
        await page2.click("#email");
        await page2.type("#email", secondUser.email);
        await page2.click("#password");
        await page2.type("#password", secondUser.password);
        await page2.click("#confirmPassword");
        await page2.type("#confirmPassword", secondUser.password);

        await Promise.all([
            page2.waitForNavigation(),
            page2.click('#submit')
        ]);
        expect(page2.url()).toEqual(APP + "LoginScreen/MySentences")//redirect to personal info page
        await page2.waitForSelector('#MySentencesPage')

        //create a new room with original account and wait for other player (also fetch room number)
        await Promise.all([
            page.waitForSelector('#openRoomPopUp'),
            page.click('#createNewRoomBTN')
        ]);
        await Promise.all([
            page.waitFor(() => !document.querySelector("#openRoomPopUp")),
            page.click("#cancelBTN")
        ]);
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


        await page2.waitForSelector('#roomNameHeader')
        var someText = await page2.evaluate(() => document.getElementById('roomNameHeader').textContent)
        expect(someText).toEqual(`Room Name:${room.name}`);//correct room name
        someText = await page2.evaluate(() => document.getElementById('userNameHeader').textContent)
        expect(someText).toEqual(`User Name:${secondUser.nickname}`);//correct nickname
        someText = await page2.evaluate(() => document.getElementById('roomNumberHeader').textContent)
        expect(someText).toEqual(`Room Number:${number}`);//correct nickname


        //expect that the first user will appear on the second user's screen
        var text = lead.nickname
        await page2.waitForFunction(
            text => document.querySelector('body').innerText.includes(text),
            {},
            text
        );

        //expect that the second user will appear on the first user's screen
        text = secondUser.nickname
        await page.waitForFunction(
            text => document.querySelector('body').innerText.includes(text),
            {},
            text
        );
        await page2.waitForSelector('#logOutBTN')
        await Promise.all([
            page2.waitForNavigation(),
            page2.click('#logOutBTN')
        ]);
        await page2.waitForSelector("#TrueAndFalseHomePage")
    }, 300000)

});