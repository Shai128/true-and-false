import faker from "faker";
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
const homePage = "http://localhost:3000/LoginScreen/Home"
import 'babel-polyfill';
const iPhone = puppeteer.devices['iPhone 6'];

let page;
let browser;
const width = 1920;
const height = 1080;
const pass = "000000"

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 20,
        args: [`--window-size=${width},${height}`]
    });
    //page = await browser.newPage();
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    //await page.emulate(iPhone);
    await page.setViewport({ width, height });
    await page.goto(APP);
    await page.waitForSelector('#TrueAndFalseHomePage')
});

afterAll(() => {
    browser.close();
});

describe("signInAndSignUp", () => {

    test("succesful sign up", async () => {

        for (i = 0; i < 20; i++) {
            await Promise.all([
                page.waitForNavigation(),
                page.click('#signUpBTN')
            ]);
            await page.waitForSelector('#SignUpPage')

            await page.click("#firstName");
            await page.type("#firstName", i);
            await page.click("#nickName");
            await page.type("#nickName", i);
            await page.click("#email");
            await page.type("#email", i + "@gmail.com");
            await page.click("#password");
            await page.type("#password", pass);
            await page.click("#confirmPassword");
            await page.type("#confirmPassword", pass);
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
        }




    }, 300000);
});