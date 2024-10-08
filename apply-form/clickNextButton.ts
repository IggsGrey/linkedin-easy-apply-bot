import { Page } from 'puppeteer';

import selectors from '../selectors';
import { withPauseCheck } from '../utils/pause';

const clickNextButton = withPauseCheck(async(page: Page): Promise<void> => {
  await page.click(selectors.nextButton);

  await page.waitForSelector(selectors.enabledSubmitOrNextButton, { timeout: 10000 });
})

export default clickNextButton;
