import { Page } from 'puppeteer';
import { withPauseCheck } from '../utils/pauseCheck';

const waitForNoError = withPauseCheck(async(page: Page): Promise<void> => {
  await page.waitForFunction(() => !document.querySelector("div[id*='error'] div[class*='error']"), { timeout: 1000 });
})

export default waitForNoError;
