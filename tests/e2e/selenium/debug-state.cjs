const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

(async () => {
  const options = new chrome.Options().addArguments('--headless=new', '--disable-gpu', '--no-sandbox').windowSize({ width: 1280, height: 900 });
  const service = new chrome.ServiceBuilder(chromedriver.path);
  const driver = await new Builder().forBrowser('chrome').setChromeService(service).setChromeOptions(options).build();
  try {
    await driver.get('http://localhost:4173');
    await driver.executeScript(`window.localStorage.setItem('glowtics_app_data_v1', ${JSON.stringify(JSON.stringify({ user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: { skinAnalysis: null, hairAnalysis: null, lastAnalyzedAt: null }, nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] }, reports: { glowScoreHistory: [], triggerHistory: [], productLog: [] } }))});`);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    const text = await driver.executeScript('return document.body.innerText');
    console.log('BODYTEXT_START');
    console.log(text);
    console.log('BODYTEXT_END');
    const keys = await driver.executeScript('return Object.keys(window.localStorage)');
    console.log('LOCALSTORAGE', keys);
    const user = await driver.executeScript('return window.localStorage.getItem("glowtics_app_data_v1")');
    console.log('STORED', user);
  } catch (err) {
    console.error(err);
  } finally {
    await driver.quit();
  }
})();
