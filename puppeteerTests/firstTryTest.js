const puppeteer = require('puppeteer');
//const iPhone = puppeteer.devices['iPhone 6'];

(async () => {
    const browser = await puppeteer.launch({headless: true, product: "chrome", defaultViewport:{width:800, height:600, hasTouch: true}});
  const page = await browser.newPage();
  //await page.emulate(iPhone);
  page.on('load', () => console.log('Page loaded!'));
  page.on('close', () => console.log('Page closed!'));
  try{
    await page.goto('http://localhost:3000/');
    
  }catch(e){
     console.log("could not connect to site");
     await browser.close();
     return;
  }
  
    await Promise.all([
        page.waitForNavigation(),
        page.click('#signInBTN')
    ]);

  
  await page.screenshot({path: 'puppeteerTests/example.png'});
  await browser.close();
})();

