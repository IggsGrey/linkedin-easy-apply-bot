import { ElementHandle, Page } from 'puppeteer';
import { withPauseCheck } from '../utils/pauseCheck';

import selectors from '../selectors';
import changeTextInput from './changeTextInput';

const insertHomeCity = withPauseCheck(async(page: Page, homeCity: string): Promise<void> => {
  await changeTextInput(page, selectors.homeCity, homeCity);

  // click the background to make the country popup lose focus
  let background = await page.$(selectors.easyApplyFormBackground) as ElementHandle;
  await background.click({ clickCount: 1 });      
})

export default insertHomeCity;
