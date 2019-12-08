import faker from "faker";
import puppeteer from "puppeteer";
const APP = "http://localhost:3000/";
import 'babel-polyfill';

let page;
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
      slowMo: 80,
      args: [`--window-size=${width},${height}`]
    });
    page = await browser.newPage();
    await page.setViewport({ width, height });
  });

  afterAll(() => {
    browser.close();
  });

  describe("myFirstTest!", () => {

    test("simple form fill", async () => {
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signUpBTN')
        ]);
        //await page.waitForSelector("[data-test=contact-form]");
    await page.click("#firstName");
    await page.type("#firstName", lead.name);
    await page.click("#nickName");
    await page.type("#nickName", lead.nickname);
    await page.click("#email");
    await page.type("#email", lead.email);
    await page.click("#password");
    await page.type("#password", lead.password);
    await page.screenshot({path: 'puppeteerTests/example1.png'});
    await page.click("#submit");
    await page.screenshot({path: 'puppeteerTests/example.png'});
    }, 30000);

    test("succesful log in", async () => {
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        //await page.waitForSelector("[data-test=contact-form]");
    await page.click("#EmailInput");
    await page.type("#EmailInput", lead.email);
    await page.click("#PasswordInput");
    await page.type("#PasswordInput", lead.password);
    await page.screenshot({path: 'puppeteerTests/example1.png'});
    await page.click("#submit");
    await page.screenshot({path: 'puppeteerTests/example.png'});
    }, 30000);

  });