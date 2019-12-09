import faker from "faker";
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
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
        slowMo: 20,
        args: [`--window-size=${width},${height}`]
    });
    page = await browser.newPage();
    //page2 = await browser.newPage();
    //await page.emulate(iPhone);
    await page.setViewport({ width, height });
    //await page2.setViewport({ width, height });
});

afterAll(() => {
    browser.close();
});

describe("signInAndSignUp", () => {

    test("succesful sign up", async () => {
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
    }, 30000);

    test("succesful sign in", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//redirect to signIn page
        await page.click("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await page.click("#submit");

        HTMLelement = await page.$('div.LoginScreenHomePage')
        expect(HTMLelement).not.toBeNull;//redirect to home page

        const welcomeMessage = await page.evaluate(() => document.getElementById('welcomeMessage').textContent)
        expect(welcomeMessage).toEqual(`Welcome ${lead.email}!`);//greet by correct name

    }, 30000);

    test("failed sign up", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signUpBTN')
        ]);
        HTMLelement = await page.$('div.SignUpPage')
        expect(HTMLelement).not.toBeNull;//redirect to signUp page

        await page.click("#submit");
        HTMLelement = await page.$('div.SignUpPage')
        expect(HTMLelement).not.toBeNull;//stay in signUp page

        await page.click("#firstName");
        await page.type("#firstName", lead.name);
        await page.click("#nickName");
        await page.type("#nickName", lead.nickname);
        await page.click("#email");
        await page.type("#email", lead.email);
        await page.click("#password");
        await page.type("#password", lead.password);
        await page.click("#submit");
        HTMLelement = await page.$('div.SignUpPage')
        expect(HTMLelement).not.toBeNull;//stay in signUp page

    }, 30000);

    test("failed sign in", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//redirect to signIn page

        await page.click("#submit");
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//stay in the signIn page

        await page.focus("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#submit");
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//stay in the signIn page

        await page.focus("#EmailInput");
        const inputValue = await page.$eval('#EmailInput', el => el.value);
        for (let i = 0; i < inputValue.length; i++) {
            await page.keyboard.press('Backspace');
        }
        await page.focus("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await page.click("#submit");
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//stay in the signIn page

        await page.click("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", "BAD_PASSWORD");
        await page.click("#submit");
        HTMLelement = await page.$('div.SignInPage')
        expect(HTMLelement).not.toBeNull;//stay in the signIn page
    }, 30000);

});