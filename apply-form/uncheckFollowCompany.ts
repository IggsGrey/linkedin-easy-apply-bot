import { ElementHandle, Page } from "puppeteer";

import selectors from "../selectors";
import { withPauseCheck } from "../utils/pause";

const uncheckFollowCompany = withPauseCheck(async(page: Page) => {
  const checkbox = await page.$(selectors.followCompanyCheckbox);

  if(checkbox)
    await (checkbox as ElementHandle<HTMLInputElement>).evaluate(el => el.checked && el.click());
})

export default uncheckFollowCompany;
