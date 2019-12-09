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


beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 40,
        args: [`--window-size=${width},${height}`]
    });
    page = await browser.newPage();
    //page2 = await browser.newPage();
    //await page.emulate(iPhone);
    await page.setViewport({ width, height });
    //await page2.setViewport({ width, height });

    var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signUpBTN')
        ]);
        HTMLelement = await page.$('div.SignUpPage')
        expect(HTMLelement).not.toBeNull;//redirect to signUp page
        await page.click("#firstName");
        await page.type("#firstName", lead.name);
        await page.click("#nickName");
        await page.type("#nickName", lead.nickname);
        await page.click("#email");
        await page.type("#email", lead.email);
        await page.click("#password");
        await page.type("#password", lead.password);
        await page.click("#submit");

        HTMLelement = await page.$('div.MySentencesPage')
        expect(HTMLelement).not.toBeNull;//redirect to personal info page

        await Promise.all([
            page.waitForNavigation(),
            page.click('#homeBTN')
        ]);

        HTMLelement = await page.$('div.LoginScreenHomePage')
        expect(HTMLelement).not.toBeNull;//redirect to home page
}, 700000);

afterAll(() => {
    browser.close();
});

describe("roomCreateAndJoinTest", () => {

    test("successfull roomCreation", async () => {
        await Promise.all([
            page.waitForSelector('#form-dialog-title'),
            page.click('#createNewRoomBTN')
        ]);
                
        await Promise.all([
            page.waitFor(() => !document.querySelector("#form-dialog-title")),
            page.click("#cancelBTN")
        ]);
        
        await Promise.all([
            page.waitForSelector('#form-dialog-title'),
            page.click('#createNewRoomBTN')
        ]);

        const room = {
            name: faker.name.title(),
            nickname: faker.name.firstName(),
        };

        await page.click("#roomName");
        await page.type("#roomName", room.name);

        await page.focus("#nickName");
        const inputValue = await page.$eval('#nickName', el => el.value);
        for (let i = 0; i < inputValue.length; i++) {
            await page.keyboard.press('Backspace');
        }
        await page.click("#nickName");
        await page.type("#nickName", room.nickname);
        
        //await page.click("#startBTN");

    }, 30000);

});