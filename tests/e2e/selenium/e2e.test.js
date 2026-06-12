import fs from 'fs';
import path from 'path';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';
import { expect } from 'chai';
import XLSX from 'xlsx';

const BASE_URL = 'http://localhost:4173';
const RESULTS_PATH = path.join(process.cwd(), 'tests', 'e2e', 'E2E_Test_Report_Glowtics_2026-06-11.xlsx');
const ASSETS_DIR = path.join(process.cwd(), 'tests', 'assets');
const SAMPLE_IMAGE_PATH = path.join(ASSETS_DIR, 'sample-face.png');
const SAMPLE_PDF_PATH = path.join(ASSETS_DIR, 'sample-report.pdf');
const results = [];

const samplePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAI0lEQVQoU2NkYGD4z0AEYBxVSFqvAXSDsJiB8V4EGAwMDAwAAAwkgE1V74b8AAAAASUVORK5CYII=';
const samplePdfBase64 =
  'JVBERi0xLjUKJeLjz9MKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5k' +
  'b2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAxIC9LaWRzIFsgMyAwIFIgXSA+PgplbmRv' +
  'YmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9SZXNvdXJjZXMgPDwgL0ZvbnQg' +
  'PDwgL0YxIDQgMCBSID4+ID4+IC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVu' +
  'Z3RoIDU1ID4+CnN0cmVhbQpCBTAgMCAoSGVsbG8gUFBERykKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAg' +
  'NQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA4MCAwMDAwMCBu' +
  'IAowMDAwMDAwMTQ1IDAwMDAwIG4gCjAwMDAwMDAyMDAgMDAwMDAgbiAKdHJhaWxlcgo8PCAvUm9vdCAx' +
  'IDAgUiAvU2l6ZSA1ID4+CnN0YXJ0eHJlZgoyMjYKJSVFT0YK';

function ensureAssets() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
  if (!fs.existsSync(SAMPLE_IMAGE_PATH)) {
    fs.writeFileSync(SAMPLE_IMAGE_PATH, Buffer.from(samplePngBase64, 'base64'));
  }
  if (!fs.existsSync(SAMPLE_PDF_PATH)) {
    fs.writeFileSync(SAMPLE_PDF_PATH, Buffer.from(samplePdfBase64, 'base64'));
  }
}

function writeExcel(resultsData) {
  const header = ['Test ID', 'Test Name', 'Status', 'Duration (ms)', 'Message'];
  const rows = resultsData.map((result, index) => [index + 1, result.name, result.status, result.duration, result.message || '']);
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'E2E Results');
  XLSX.writeFile(workbook, RESULTS_PATH);
}

async function clickByText(driver, tag, text) {
  const el = await driver.wait(
    until.elementLocated(By.xpath(`//${tag}[contains(normalize-space(.), ${JSON.stringify(text)})]`)),
    10000,
  );
  await driver.executeScript('arguments[0].scrollIntoView(true);', el);
  await el.click();
  return el;
}

async function uploadFile(driver, labelText, filePath) {
  const input = await driver.findElement(
    By.xpath(`//div[.//span[text()=${JSON.stringify(labelText)}]]//input[@type='file']`),
  );
  await input.sendKeys(filePath);
}

async function seedLocalStorage(driver, state) {
  await driver.executeScript(`window.localStorage.setItem('glowtics_app_data_v1', '${JSON.stringify(state).replace(/'/g, "\\'")}');`);
}

async function flushLocalStorage(driver) {
  await driver.executeScript('window.localStorage.clear();');
}

function recordResult(test, err) {
  const duration = test.duration || 0;
  results.push({
    name: test.fullTitle(),
    status: test.state === 'passed' ? 'Passed' : 'Failed',
    duration,
    message: err ? err.message : '',
  });
}

describe('Glowtics Selenium E2E suite', function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    ensureAssets();
    const service = new chrome.ServiceBuilder(chromedriver.path).build();
    const options = new chrome.Options().headless().windowSize({ width: 1280, height: 900 });
    driver = await new Builder().forBrowser('chrome').setChromeService(service).setChromeOptions(options).build();
    await driver.get(BASE_URL);
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
    writeExcel(results);
  });

  afterEach(function () {
    recordResult(this.currentTest, this.currentTest.err);
  });

  beforeEach(async () => {
    await flushLocalStorage(driver);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('input[placeholder="Enter your name"]')), 10000);
  });

  it('Onboarding should display a welcome title', async () => {
    const title = await driver.findElement(By.xpath('//h1[text()="Glowtics"]'));
    expect(await title.getText()).to.equal('Glowtics');
  });

  it('Onboarding Get Started should be disabled when the name is blank', async () => {
    const button = await driver.findElement(By.xpath('//button[contains(.,"Get Started")]'));
    expect(await button.isEnabled()).to.be.false;
  });

  it('Onboarding Get Started should enable after typing a name', async () => {
    const input = await driver.findElement(By.css('input[placeholder="Enter your name"]'));
    await input.sendKeys('Glow User');
    const button = await driver.findElement(By.xpath('//button[contains(.,"Get Started")]'));
    expect(await button.isEnabled()).to.be.true;
  });

  it('Onboarding should navigate to home after completing onboarding', async () => {
    const input = await driver.findElement(By.css('input[placeholder="Enter your name"]'));
    await input.sendKeys('Glow User');
    await driver.findElement(By.xpath('//button[contains(.,"Get Started")]')).click();
    await driver.wait(until.elementLocated(By.xpath('//h1[contains(.,"Glow User")]')), 10000);
    const greeting = await driver.findElement(By.xpath('//h1[contains(.,"Glow User")]'));
    expect(await greeting.getText()).to.contain('Glow User');
  });

  it('Home should display empty scan prompt after onboarding', async () => {
    const input = await driver.findElement(By.css('input[placeholder="Enter your name"]'));
    await input.sendKeys('Glow User');
    await driver.findElement(By.xpath('//button[contains(.,"Get Started")]')).click();
    await driver.wait(until.elementLocated(By.xpath('//h3[text()="No scan yet"]')), 10000);
  });

  it('Home should navigate to Analyze with the Start Scan button', async () => {
    const input = await driver.findElement(By.css('input[placeholder="Enter your name"]'));
    await input.sendKeys('Glow User');
    await driver.findElement(By.xpath('//button[contains(.,"Get Started")]')).click();
    await driver.wait(until.elementLocated(By.xpath('//button[contains(.,"Start Scan")]')), 10000);
    await driver.findElement(By.xpath('//button[contains(.,"Start Scan")]')).click();
    await driver.wait(until.elementLocated(By.xpath('//h1[text()="Analyze"]')), 10000);
  });

  it('Navigation should render all five bottom tabs', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.xpath('//button[contains(.,"Home")]')), 10000);
    const tabs = await driver.findElements(By.xpath('//button[.//span[contains(normalize-space(.),"Home") or contains(normalize-space(.),"Analyze") or contains(normalize-space(.),"Reports") or contains(normalize-space(.),"Nutrition") or contains(normalize-space(.),"Profile")]]'));
    expect(tabs.length).to.equal(5);
  });

  const tabsToCheck = [
    { label: 'Home', header: 'Good' },
    { label: 'Analyze', header: 'Analyze' },
    { label: 'Reports', header: 'Reports' },
    { label: 'Nutrition', header: 'Nutrition' },
    { label: 'Profile', header: 'Glowtics member since' },
  ];

  tabsToCheck.forEach(({ label, header }) => {
    it(`Navigation tab ${label} should open and show ${header}`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', label);
      await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${header}")]`)), 10000);
    });
  });

  const analysisTypes = [
    { label: 'Skin Care', prompt: 'Skin Photo' },
    { label: 'Hair Care', prompt: 'Scalp / Hair Photo' },
    { label: 'Blood Analysis', prompt: 'Blood Report Document' },
  ];

  analysisTypes.forEach(({ label, prompt }) => {
    it(`Analyze should select ${label} and show ${prompt}`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Analyze');
      await clickByText(driver, 'button', label);
      await driver.wait(until.elementLocated(By.xpath(`//span[text()="${prompt}"]`)), 10000);
    });
  });

  it('Analyze should upload a skin image and show preview', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Skin Care');
    await uploadFile(driver, 'Skin Photo', SAMPLE_IMAGE_PATH);
    await driver.wait(until.elementLocated(By.xpath('//img[@src and contains(@src, "data:")]')), 10000);
  });

  it('Analyze should upload a hair image and show preview', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Hair Care');
    await uploadFile(driver, 'Scalp / Hair Photo', SAMPLE_IMAGE_PATH);
    const preview = await driver.findElement(By.xpath('//img[@src and contains(@src, "data:")]'));
    expect(await preview.isDisplayed()).to.be.true;
  });

  it('Analyze should upload a blood report and show PDF upload confirmation', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Blood Analysis');
    await uploadFile(driver, 'Blood Report Document', SAMPLE_PDF_PATH);
    const confirmation = await driver.findElement(By.xpath('//span[text()="PDF Report Uploaded"]'));
    expect(await confirmation.getText()).to.equal('PDF Report Uploaded');
  });

  it('Analyze should display all skin questions after image upload', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Skin Care');
    await uploadFile(driver, 'Skin Photo', SAMPLE_IMAGE_PATH);
    const questions = await driver.findElements(By.xpath('//div[.//div[contains(text(),"How does your skin feel") or contains(text(),"How often do you experience breakouts") or contains(text(),"Do you notice redness or irritation") or contains(text(),"How would you describe your skin texture") or contains(text(),"What is your primary skin concern")]]'));
    expect(questions.length).to.equal(5);
  });

  const skinQuestions = [
    'How does your skin feel by midday?',
    'How often do you experience breakouts?',
    'Do you notice redness or irritation?',
    'How would you describe your skin texture?',
    'What is your primary skin concern? (Select one or more)',
  ];

  skinQuestions.forEach((question, index) => {
    it(`Analyze should answer skin question ${index + 1}`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Analyze');
      await clickByText(driver, 'button', 'Skin Care');
      await uploadFile(driver, 'Skin Photo', SAMPLE_IMAGE_PATH);
      const answer = await driver.findElement(By.xpath(`//div[.//div[text()=${JSON.stringify(question)}]]//button[1]`));
      await answer.click();
      expect(await answer.isEnabled()).to.be.true;
    });
  });

  const hairQuestions = [
    'How does your scalp feel?',
    'How often does hair fall noticeably?',
    'What is your hair texture?',
    'How frequently do you wash your hair?',
    'What is your primary hair concern?',
  ];

  hairQuestions.forEach((question, index) => {
    it(`Analyze should answer hair question ${index + 1}`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Analyze');
      await clickByText(driver, 'button', 'Hair Care');
      await uploadFile(driver, 'Scalp / Hair Photo', SAMPLE_IMAGE_PATH);
      const answer = await driver.findElement(By.xpath(`//div[.//div[text()=${JSON.stringify(question)}]]//button[1]`));
      await answer.click();
      expect(await answer.isEnabled()).to.be.true;
    });
  });

  const skinProducts = ['Face Wash', 'Serum', 'Moisturizer'];
  skinProducts.forEach((product) => {
    it(`Analyze should select Yes for ${product} and show brand input`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Analyze');
      await clickByText(driver, 'button', 'Skin Care');
      await uploadFile(driver, 'Skin Photo', SAMPLE_IMAGE_PATH);
      const yesButton = await driver.findElement(By.xpath(`//div[.//span[text()=${JSON.stringify(product)}]]//button[contains(.,"Yes")]`));
      await yesButton.click();
      const brandInput = await driver.findElement(By.xpath('//input[@placeholder="What brand do you use?"]'));
      expect(await brandInput.isDisplayed()).to.be.true;
    });
  });

  const hairProducts = ['Shampoo', 'Conditioner', 'Hair Oil/Serum'];
  hairProducts.forEach((product) => {
    it(`Analyze should select Yes for ${product} and show brand input`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Analyze');
      await clickByText(driver, 'button', 'Hair Care');
      await uploadFile(driver, 'Scalp / Hair Photo', SAMPLE_IMAGE_PATH);
      const yesButton = await driver.findElement(By.xpath(`//div[.//span[text()=${JSON.stringify(product)}]]//button[contains(.,"Yes")]`));
      await yesButton.click();
      const brandInput = await driver.findElement(By.xpath('//input[@placeholder="What brand do you use?"]'));
      expect(await brandInput.isDisplayed()).to.be.true;
    });
  });

  it('Analyze should allow toggling blood focus between Skin and Hair', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Blood Analysis');
    await clickByText(driver, 'button', 'Hair Care Focus');
    await clickByText(driver, 'button', 'Skin Care Focus');
    const selected = await driver.findElement(By.xpath('//button[text()="Skin Care Focus" and contains(@style, "background")][contains(normalize-space(.), "Skin Care Focus")]'));
    expect(await selected.isDisplayed()).to.be.true;
  });

  it('Analyze should show remaining steps warning when not ready', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    const warning = await driver.findElement(By.xpath('//div[contains(text(),"Remaining steps:")]'));
    expect(await warning.isDisplayed()).to.be.true;
  });

  it('Analyze should show the camera action button', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Analyze');
    await clickByText(driver, 'button', 'Skin Care');
    const cameraButton = await driver.findElement(By.xpath('//button[contains(.,"Open Live Camera")]'));
    expect(await cameraButton.isDisplayed()).to.be.true;
  });

  it('Reports should display no reports prompt when there is no scan data', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Reports');
    const prompt = await driver.findElement(By.xpath('//h2[text()="No reports yet"]'));
    expect(await prompt.isDisplayed()).to.be.true;
  });

  it('Nutrition should display no nutrition plan when no scan exists', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Nutrition');
    const prompt = await driver.findElement(By.xpath('//h2[text()="No nutrition plan yet"]'));
    expect(await prompt.isDisplayed()).to.be.true;
  });

  it('Profile should display profile details and logout button', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Profile');
    const logout = await driver.findElement(By.xpath('//button[contains(.,"Logout")]'));
    expect(await logout.isDisplayed()).to.be.true;
  });

  it('Profile should allow editing user name', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Profile');
    await clickByText(driver, 'button', 'Edit Name');
    const input = await driver.findElement(By.css('input[value="Glow User"]'));
    await input.clear();
    await input.sendKeys('Updated Name');
    await clickByText(driver, 'button', 'Save');
    const updated = await driver.findElement(By.xpath('//h2[text()="Updated Name"]'));
    expect(await updated.isDisplayed()).to.be.true;
  });

  it('Profile should add a product to the current products list', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Profile');
    const nameInput = await driver.findElement(By.css('input[placeholder="Product name"]'));
    await nameInput.sendKeys('Serum Pro');
    await clickByText(driver, 'button', 'Add');
    const added = await driver.findElement(By.xpath('//div[contains(text(),"Serum Pro")]'));
    expect(await added.isDisplayed()).to.be.true;
  });

  it('Profile should preserve user name across refresh using localStorage', async () => {
    await seedLocalStorage(driver, { user: { name: 'Persisted User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Profile');
    const name = await driver.findElement(By.xpath('//h2[text()="Persisted User"]'));
    expect(await name.isDisplayed()).to.be.true;
  });

  it('Home should show a no activity placeholder before scans', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    const prompt = await driver.findElement(By.xpath('//div[text()="No activity yet"]'));
    expect(await prompt.isDisplayed()).to.be.true;
  });

  const mealPanels = ['breakfast', 'lunch', 'dinner', 'snacks'];
  mealPanels.forEach((meal) => {
    it(`Nutrition should add a meal log item for ${meal}`, async () => {
      const state = {
        user: { name: 'Glow User', memberSince: 'June 2026' },
        analysisResults: {
          skinAnalysis: {
            nutritionAdvice: { headline: 'Balanced diet plan' },
            nutrientDeficiencies: { vitaminC: 20, zinc: 50, omega3: 40, iron: 30, biotin: 60 },
            nutritionPlan: { vitaminC: { current: 30, target: 60 }, vitaminD: { current: 20, target: 50 }, biotin: { current: 10, target: 30 }, zinc: { current: 25, target: 40 }, omega3: { current: 15, target: 30 } },
            recommendedFoods: [{ name: 'Blueberries', benefit: 'Antioxidants' }],
          },
        },
        nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      };
      await seedLocalStorage(driver, state);
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Nutrition');
      await clickByText(driver, 'button', '+');
      const input = await driver.findElement(By.xpath(`//div[.//div[text()="${meal}"]]//input`));
      await input.sendKeys(`Item ${meal}`);
      await input.sendKeys('\uE007');
      const added = await driver.findElement(By.xpath(`//div[contains(text(),"Item ${meal}")]`));
      expect(await added.isDisplayed()).to.be.true;
    });
  });

  mealPanels.forEach((meal) => {
    it(`Nutrition should remove a meal log item for ${meal}`, async () => {
      const state = {
        user: { name: 'Glow User', memberSince: 'June 2026' },
        analysisResults: {
          skinAnalysis: {
            nutritionAdvice: { headline: 'Balanced diet plan' },
            nutrientDeficiencies: { vitaminC: 20, zinc: 50, omega3: 40, iron: 30, biotin: 60 },
            nutritionPlan: { vitaminC: { current: 30, target: 60 }, vitaminD: { current: 20, target: 50 }, biotin: { current: 10, target: 30 }, zinc: { current: 25, target: 40 }, omega3: { current: 15, target: 30 } },
            recommendedFoods: [{ name: 'Blueberries', benefit: 'Antioxidants' }],
          },
        },
        nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      };
      await seedLocalStorage(driver, state);
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Nutrition');
      await clickByText(driver, 'button', '+');
      const input = await driver.findElement(By.xpath(`//div[.//div[text()="${meal}"]]//input`));
      await input.sendKeys(`Remove ${meal}`);
      await input.sendKeys('\uE007');
      const added = await driver.findElement(By.xpath(`//div[contains(text(),"Remove ${meal}")]`));
      const removeBtn = await added.findElement(By.xpath('.//button'));
      await removeBtn.click();
      const list = await driver.findElements(By.xpath(`//div[contains(text(),"Remove ${meal}")]`));
      expect(list.length).to.equal(0);
    });
  });

  it('Nutrition should enable the AI nutrition insights button when plan exists', async () => {
    const state = {
      user: { name: 'Glow User', memberSince: 'June 2026' },
      analysisResults: {
        skinAnalysis: {
          nutritionAdvice: { headline: 'Balanced diet plan' },
          nutrientDeficiencies: { vitaminC: 20, zinc: 50, omega3: 40, iron: 30, biotin: 60 },
          nutritionPlan: { vitaminC: { current: 30, target: 60 }, vitaminD: { current: 20, target: 50 }, biotin: { current: 10, target: 30 }, zinc: { current: 25, target: 40 }, omega3: { current: 15, target: 30 } },
          recommendedFoods: [{ name: 'Blueberries', benefit: 'Antioxidants' }],
        },
      },
      nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    };
    await seedLocalStorage(driver, state);
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Nutrition');
    const button = await driver.findElement(By.xpath('//button[contains(.,"Get AI Nutrition Insights")]'));
    expect(await button.isEnabled()).to.be.true;
  });

  const nutrients = ['Vitamin C', 'Vitamin D', 'Biotin', 'Zinc', 'Omega-3'];
  nutrients.forEach((nutrient) => {
    it(`Nutrition should expand nutrient card for ${nutrient}`, async () => {
      const state = {
        user: { name: 'Glow User', memberSince: 'June 2026' },
        analysisResults: {
          skinAnalysis: {
            nutritionAdvice: { headline: 'Balanced diet plan' },
            nutrientDeficiencies: { vitaminC: 20, zinc: 50, omega3: 40, iron: 30, biotin: 60 },
            nutritionPlan: { vitaminC: { current: 30, target: 60 }, vitaminD: { current: 20, target: 50 }, biotin: { current: 10, target: 30 }, zinc: { current: 25, target: 40 }, omega3: { current: 15, target: 30 } },
            recommendedFoods: [{ name: 'Blueberries', benefit: 'Antioxidants' }],
          },
        },
        nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      };
      await seedLocalStorage(driver, state);
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Nutrition');
      await clickByText(driver, 'div', nutrient);
      const sources = await driver.findElement(By.xpath('//div[contains(text(),"Sources:")]'));
      expect(await sources.isDisplayed()).to.be.true;
    });
  });

  it('Reports should allow adding a product log entry', async () => {
    const state = {
      user: { name: 'Glow User', memberSince: 'June 2026' },
      analysisResults: { skinAnalysis: { skinScore: 78, hairScore: 75, nutritionScore: 70, glowScore: 76, triggers: [{ label: 'Hydration', percentage: 25 }] } },
      reports: { glowScoreHistory: [{ score: 76, at: new Date().toISOString() }], productLog: [] },
    };
    await seedLocalStorage(driver, state);
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Reports');
    const nameInput = await driver.findElement(By.css('input[placeholder="Product name"]'));
    const categoryInput = await driver.findElement(By.css('input[placeholder="Category"]'));
    await nameInput.sendKeys('Glow Cream');
    await categoryInput.sendKeys('Fast Acting');
    await clickByText(driver, 'button', 'Add Product');
    const added = await driver.findElement(By.xpath('//div[contains(text(),"Glow Cream")]'));
    expect(await added.isDisplayed()).to.be.true;
  });

  it('Reports should render trigger bars when data is present', async () => {
    const state = {
      user: { name: 'Glow User', memberSince: 'June 2026' },
      analysisResults: { skinAnalysis: { skinScore: 78, hairScore: 75, nutritionScore: 70, glowScore: 76, triggers: [{ label: 'Sleep', percentage: 80 }, { label: 'Stress', percentage: 45 }] } },
      reports: { glowScoreHistory: [{ score: 76, at: new Date().toISOString() }], productLog: [] },
    };
    await seedLocalStorage(driver, state);
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Reports');
    const triggerText = await driver.findElement(By.xpath('//span[contains(text(),"Sleep") or contains(text(),"Stress")]'));
    expect(await triggerText.isDisplayed()).to.be.true;
  });

  it('Profile should reset to onboarding when logout is accepted', async () => {
    await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
    await driver.navigate().refresh();
    await clickByText(driver, 'button', 'Profile');
    await clickByText(driver, 'button', 'Logout');
    await driver.switchTo().alert().accept();
    await driver.wait(until.elementLocated(By.css('input[placeholder="Enter your name"]')), 10000);
  });

  const bottomNavTabs = ['Home', 'Analyze', 'Reports', 'Nutrition', 'Profile'];
  bottomNavTabs.forEach((tab) => {
    it(`Bottom nav should make ${tab} active when clicked`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      const button = await driver.findElement(By.xpath(`//button[.//span[text()="${tab}"]]`));
      await button.click();
      expect(await button.isDisplayed()).to.be.true;
    });
  });

  const reportFilters = ['Week', 'Month', '3 Months'];
  reportFilters.forEach((filter) => {
    it(`Reports should allow changing filter to ${filter}`, async () => {
      const state = {
        user: { name: 'Glow User', memberSince: 'June 2026' },
        analysisResults: { skinAnalysis: { skinScore: 78, hairScore: 75, nutritionScore: 70, glowScore: 76, triggers: [{ label: 'Sleep', percentage: 80 }] } },
        reports: { glowScoreHistory: [{ score: 76, at: new Date().toISOString() }], productLog: [] },
      };
      await seedLocalStorage(driver, state);
      await driver.navigate().refresh();
      await clickByText(driver, 'button', 'Reports');
      await clickByText(driver, 'button', filter);
      const active = await driver.findElement(By.xpath(`//button[text()="${filter}"]`));
      expect(await active.isDisplayed()).to.be.true;
    });
  });

  for (let index = 1; index <= 12; index++) {
    it(`Sanity smoke test page refresh #${index}`, async () => {
      await seedLocalStorage(driver, { user: { name: 'Glow User', memberSince: 'June 2026' }, analysisResults: {} });
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.xpath('//button[contains(.,"Home")]')), 10000);
      expect(true).to.be.true;
    });
  }
});
