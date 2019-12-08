const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  console.log('pls!')
  await page.goto('http://localhost:3000/');
    await Promise.all([
        page.waitForNavigation(),
        page.click('#please')
    ]);
  
  await page.screenshot({path: 'puppeteerTests/example.png'});
    console.log('pls')
  await browser.close();

})();

// (async function main() {
//     try {
//         const browser = await puppeteer.launch({headless: true});
//         const page = await browser.newPage();
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
//         await page.goto('http://example.com');
//          //your code
//          await browser.close();
//     }
//     catch(e){
//         console.log(e);
//     }
// })();