import { Page } from 'puppeteer';

import selectors from '../selectors';
import changeTextInput from './changeTextInput';
import { withPauseCheck } from '../utils/pauseCheck';

const insertPhone = withPauseCheck(async(page: Page, phone: string): Promise<void> => {
  await changeTextInput(page, selectors.phone, phone);
})

export default insertPhone;
