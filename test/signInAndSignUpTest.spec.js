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
});

afterAll(() => {
    browser.close();
});

describe("signInAndSignUp", () => {
    // async function fillEmptyTextBox(page, id, text) {
    //     console.log('check');
    //     await page.click("#" + id);
    //     await page.type("#" + id, text);
    // }

    test("succesful sign up", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signUpBTN')
        ]);
        expect(page.url()).toEqual(APP + "SignUp");//redirect to signUp page

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

        await page.waitForSelector('#logOutBTN')
        await Promise.all([
            page.waitForNavigation(),
            page.click('#logOutBTN')
        ]);
    }, 300000);

    test("succesful sign in", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        expect(page.url()).toEqual(APP + "SignIn")//redirect to signIn page
        await page.click("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#submit')
        ]);

        expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy();//redirect to home page
        await page.waitForSelector('#LoginScreenHomePage')
        const welcomeMessage = await page.evaluate(() => document.getElementById('welcomeMessage').textContent)
        expect(welcomeMessage).toEqual(`Welcome ${lead.name}!`);//greet by correct name

        await page.waitForSelector('#logOutBTN')
        await Promise.all([
            page.waitForNavigation(),
            page.click('#logOutBTN')
        ]);

    }, 300000);

    // test("failed sign up", async () => {
    //     var HTMLelement;
    //     await page.goto(APP);
    //     await Promise.all([
    //         page.waitForNavigation(),
    //         page.click('#signUpBTN')
    //     ]);
    //     expect(page.url()).toEqual(APP + "SignUp")//redirect to signUp page

    //     await page.click("#submit");
    //     expect(page.url()).toEqual(APP + "SignUp")//stay in signUp page

    //     await page.click("#firstName");
    //     await page.type("#firstName", lead.name);
    //     await page.click("#nickName");
    //     await page.type("#nickName", lead.nickname);
    //     await page.click("#email");
    //     await page.type("#email", lead.email);
    //     await page.click("#password");
    //     await page.type("#password", lead.password);
    //     await page.click("#submit");
    //     expect(page.url()).toEqual(APP + "SignUp")//stay in signUp page

    // }, 300000);

    test("failed sign in", async () => {
        var HTMLelement;
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);

        expect(page.url()).toEqual(APP + "SignIn");//redirect to signIn page

        await page.click("#submit");
        expect(page.url()).toEqual(APP + "SignIn")//stay in the signIn page

        await page.focus("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#submit");
        expect(page.url()).toEqual(APP + "SignIn")//stay in the signIn page

        await page.focus("#EmailInput");
        const inputValue = await page.$eval('#EmailInput', el => el.value);
        for (let i = 0; i < inputValue.length; i++) {
            await page.keyboard.press('Backspace');
        }
        await page.focus("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await page.click("#submit");
        expect(page.url()).toEqual(APP + "SignIn")//stay in the signIn page

        await page.click("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", "BAD_PASSWORD");
        await page.click("#submit");
        expect(page.url()).toEqual(APP + "SignIn")//stay in the signIn page
    }, 300000);

    test("succesful personal information change", async () => {
        //sign in
        await page.goto(APP);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        expect(page.url()).toEqual(APP + "SignIn")//redirect to signIn page
        await page.click("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.click("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#submit')
        ]);

        expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy();//redirect to home page
        await page.waitForSelector('#LoginScreenHomePage')

        //go to my profile page
        await Promise.all([
            page.waitForNavigation(),
            page.click('#myProfileBTN')
        ]);

        await page.waitForSelector('#MyProfilePage')
        expect(page.url()).toEqual(APP + "LoginScreen/MyProfile")//redirect to myProfile page

        //change name, nickname and email
        await page.focus("#firstName");
        await page.type("#firstName", "_CHANGED");
        await page.focus("#nickName");
        await page.type("#nickName", "_CHANGED");
        await page.focus("#email");
        var L = await page.$eval('#email', el => el.value);
        for (let i = 0; i < L.length; i++) {
            await page.keyboard.press('ArrowLeft');
        }
        await page.type("#email", "CHANGED_");
        await page.click('#saveBTN')
        await page.waitFor(1000)

        //check password change

        //check that cancel button works
        await Promise.all([
            page.waitForSelector('#changePasswordPopUp'),
            page.click('#changePasswordBTN')
        ]);
        await Promise.all([
            page.waitFor(() => !document.querySelector("#changePasswordPopUp")),
            page.click("#cancelBTN")
        ]);

        //check that immediate submit does not change password 
        await Promise.all([
            page.waitForSelector('#changePasswordPopUp'),
            page.click('#changePasswordBTN')
        ]);
        await page.click('#confirmBTN')
        await page.waitFor(1000)

        var text = "password saved successfuly!"
        try {
            await page.waitForFunction(
                text => !document.querySelector('body').innerText.includes(text),
                {},
                text
            );
        } catch (e) {
            console.log(`The text "${text}" was found on the page`);
        }

        //check wrong old password does not change password
        await page.click("#oldPasswordId");
        await page.type("#oldPasswordId", lead.password + "_WRONG");
        await page.click("#password");
        await page.type("#password", lead.password + "_CHANGED");
        await page.click("#confirmPasswordId");
        await page.type("#confirmPasswordId", lead.password + "_CHANGED");
        await page.click('#confirmBTN')
        await page.waitFor(1000)

        try {
            await page.waitForFunction(
                text => !document.querySelector('body').innerText.includes(text),
                {},
                text
            );
        } catch (e) {
            console.log(`The text "${text}" was found on the page`);
        }

        //check wrong confirmed password does not change password
        await page.focus("#oldPasswordId");
        for (let i = 0; i < 6; i++) { // 6 for _WRONG
            await page.keyboard.press('Backspace');
        }
        await page.click("#oldPasswordId");
        await page.type("#oldPasswordId", lead.password);

        await page.focus("#confirmPasswordId");
        await page.type("#confirmPasswordId", "NOT_SAME");
        await page.click('#confirmBTN')
        await page.waitFor(1000)
        try {
            await page.waitForFunction(
                text => !document.querySelector('body').innerText.includes(text),
                {},
                text
            );
        } catch (e) {
            console.log(`The text "${text}" was found on the page`);
        }

        //fix everything and change password successfully
        await page.focus("#confirmPasswordId");
        for (let i = 0; i < 8; i++) { // 8 for NOT_SAME
            await page.keyboard.press('Backspace');
        }
        await page.click('#confirmBTN')
        await page.waitFor(1000)
        try {
            await page.waitForFunction(
                text => document.querySelector('body').innerText.includes(text),
                {},
                text
            );
        } catch (e) {
            console.log(`The text "${text}" was not found on the page`);
        }
        await Promise.all([
            page.waitFor(() => !document.querySelector("#changePasswordPopUp")),
            page.click("#cancelBTN")
        ]);


        //check that all changes actually applied

        //log out
        await page.waitForSelector('#logOutBTN')
        await Promise.all([
            page.waitForNavigation(),
            page.click('#logOutBTN')
        ]);
        await page.waitForSelector('#TrueAndFalseHomePage')

        //try to sign in with old email and password
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBTN')
        ]);
        await page.waitForSelector('#SignInPage')
        expect(page.url()).toEqual(APP + "SignIn");//redirect to signIn page

        await page.focus("#EmailInput");
        await page.type("#EmailInput", lead.email);
        await page.focus("#PasswordInput");
        await page.type("#PasswordInput", lead.password);
        await page.click("#submit");
        expect(page.url()).toEqual(APP + "SignIn")//stay in the signIn page

        await page.focus("#EmailInput");
        //sign in with new email and password
        L = await page.$eval('#email', el => el.value);
        for (let i = 0; i < L.length; i++) {
            await page.keyboard.press('ArrowLeft');
        }
        await page.type("#EmailInput", "CHANGED_");
        await page.focus("#PasswordInput");
        await page.type("#PasswordInput", "_CHANGED");
        
        await Promise.all([
            page.waitForNavigation(),
            page.click('#submit')
        ]);

        expect(page.url() === APP + "LoginScreen/Home" || page.url() === APP + "LoginScreen").toBeTruthy();//redirect to home page
        await page.waitForSelector('#LoginScreenHomePage')
        const welcomeMessage = await page.evaluate(() => document.getElementById('welcomeMessage').textContent)
        expect(welcomeMessage).toEqual(`Welcome ${lead.name}_CHANGED!`);//greet by correct name

        await page.waitForSelector('#logOutBTN')
        await Promise.all([
            page.waitForNavigation(),
            page.click('#logOutBTN')
        ]);

    }, 300000);
});