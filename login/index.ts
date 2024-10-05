import { Page } from 'puppeteer';

import ask from '../utils/ask';
import selectors from '../selectors';
import message from '../utils/message';

interface Params {
  page: Page;
  email: string;
  password: string;
}

async function login({ page, email, password }: Params): Promise<void> {
  // Navigate to LinkedIn
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'load' });

  // Enter login credentials and submit the form
  await page.type(selectors.emailInput, email);
  await page.type(selectors.passwordInput, password);

  await page.click(selectors.loginSubmit);

  // Wait for the login to complete
  await page.waitForNavigation({ waitUntil: 'load' });

  const captcha = await page.$(selectors.captcha);
  const verificationCodePrompt = await page.evaluate(() => 
    document.body.innerText.toLowerCase().includes('please enter the verification code')
  );
  if (captcha || verificationCodePrompt) {
    const instruction = captcha ? 'solve the captcha' : 'enter the verification code'
    await ask(`Please ${instruction} and then press enter'`)
    await page.goto('https://www.linkedin.com/', { waitUntil: 'load' });
  }

  message('Logged in to LinkedIn');

  await page.click(selectors.skipButton).catch(() => { });
}

export default login;
