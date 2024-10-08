import { ElementHandle, Page } from 'puppeteer';
import LanguageDetect from 'languagedetect';

import buildUrl from '../utils/buildUrl';
import wait from '../utils/wait';
import selectors from '../selectors';
import message from '../utils/message';

const MAX_PAGE_SIZE = 7;
const languageDetector = new LanguageDetect();

export type DatePosted = 'PAST_WEEK' | 'PAST_MONTH' | 'PAST_24_HOURS';

type JobUrl = string;
type JobTitle = string;
type CompanyName = string;

const DATES_POSTED: Readonly<Record<DatePosted, string>> = Object.freeze({
  PAST_WEEK: 'r604800',
  PAST_MONTH: 'r2592000',
  PAST_24_HOURS: 'r86400',
})

export interface JobSearchParams {
  location: string,
  keywords: string,
  datePosted: DatePosted | null,
  workplace: { remote: boolean, onSite: boolean, hybrid: boolean },
  jobTitle: string,
  jobDescription: string,
  jobDescriptionLanguages: string[]
}

interface JobSearchUrlQueryParams { [key: string]: string }


async function* fetchJobLinksAsUser(page: Page, params: JobSearchParams): AsyncGenerator<[JobUrl, JobTitle, CompanyName]> {
  let numSeenJobs = 0;
  let [searchUrl, numJobsMatchingLinkedinFilterOptions] = await getSearchQueryUrlAndNumberOfJobsMatchingLinkedinFilterOptions(page, params);
  while (numSeenJobs < numJobsMatchingLinkedinFilterOptions) {
    const jobListings = await getJobListingsHtmlElements(searchUrl, page, numSeenJobs, numJobsMatchingLinkedinFilterOptions);
    yield* getMatchingJobsFromNextPageOfSearchResults(jobListings, page, params)
    await wait(2000);
    numSeenJobs += jobListings.length;
  }
}

async function getSearchQueryUrlAndNumberOfJobsMatchingLinkedinFilterOptions(page: Page, params: JobSearchParams): Promise<[URL, number]> {
  // This gets the number of jobs that match our LinkedIn UI filters but doesn't account for our job title / description filters.

  const workplaceTypeFilter = [params.workplace.onSite, params.workplace.remote, params.workplace.hybrid].reduce((acc, c, i) => c ? [...acc, i + 1] : acc, [] as number[]).join(',');

  const { geoId, numAvailableJobs } = await getJobSearchMetadata({ page, location: params.location, keywords: params.keywords });

  const urlQueryParams: JobSearchUrlQueryParams = {
    keywords: params.keywords,
    location: params.location,
    start: "0",
    f_WT: workplaceTypeFilter,
    f_AL: 'true', // filters to only Easy Apply jobs
    ...(params.datePosted && {
      f_TPR: DATES_POSTED[params.datePosted]
    }),
  };

  if(geoId) {
    urlQueryParams.geoId = geoId.toString();
  }
  const url = buildUrl('https://www.linkedin.com/jobs/search', urlQueryParams);

  return [url, numAvailableJobs]
}

async function getJobSearchMetadata({ page, location, keywords }: { page: Page, location: string, keywords: string }) {
  await page.goto('https://linkedin.com/jobs', { waitUntil: "load" });

  await wait(5e3);

  await page.type(selectors.keywordInput, keywords);
  await page.waitForSelector(selectors.locationInput, { visible: true });
  await page.$eval(selectors.locationInput, (el, location) => (el as HTMLInputElement).value = location, location);
  await page.type(selectors.locationInput, ' ');
  await page.$eval('button.jobs-search-box__submit-button', (el) => el.click());
  await page.waitForFunction(() => new URLSearchParams(document.location.search).has('geoId'));

  const geoId = await page.evaluate(() => new URLSearchParams(document.location.search).get('geoId'));

  const numJobsHandle = await page.waitForSelector(selectors.searchResultListText, { timeout: 5000 }) as ElementHandle<HTMLElement>;
  const numAvailableJobs = await numJobsHandle.evaluate((el) => parseInt((el as HTMLElement).innerText.replace(',', '')));

  return {
    geoId,
    numAvailableJobs
  };
}

async function getJobListingsHtmlElements(searchUrl: URL, page: Page, numSeenJobs: number, numJobsMatchingLinkedinFilterOptions: number) {
  searchUrl.searchParams.set('start', numSeenJobs.toString());
  await page.goto(searchUrl.toString(), { waitUntil: "load" });
  await page.waitForSelector(`${selectors.searchResultListItem}:nth-child(${Math.min(MAX_PAGE_SIZE, numJobsMatchingLinkedinFilterOptions - numSeenJobs)})`, { timeout: 5000 });
  return await page.$$(selectors.searchResultListItem);
}

async function* getMatchingJobsFromNextPageOfSearchResults(jobListings: ElementHandle<Element>[], page: Page, params: JobSearchParams): AsyncGenerator<[JobUrl, JobTitle, CompanyName]> {
  for (let i = 0; i < Math.min(jobListings.length, MAX_PAGE_SIZE); i++) {
    try {
      const [link, title] = await getJobTitleAndUrl(page, i)

      await waitUntilJobHasFinishedLoading(page);

      const companyName = await getJobCompanyName(page, i);

      if (await jobMatchesUserRequirements(page, params, title)) {
        yield [link, title, companyName];
      }
    } catch (e) {
      message(e as Error);
    }
  }
}

async function getJobTitleAndUrl(page: Page, jobSearchResultListIndex: number) {
  const [link, title] = await page.$eval(`${selectors.searchResultListItem}:nth-child(${jobSearchResultListIndex + 1}) ${selectors.searchResultListItemLink}`, (el) => {
    const linkEl = el as HTMLLinkElement;
    linkEl.click();
    return [linkEl.href.trim(), linkEl.innerText.trim()];
  });
  return [link, title]
}

async function waitUntilJobHasFinishedLoading(searchResultsPage: Page) {
  await searchResultsPage.waitForFunction(async (selectors) => {
    const hasLoadedDescription = !!document.querySelector<HTMLElement>(selectors.jobDescription)?.innerText.trim();
    const hasLoadedStatus = !!(document.querySelector(selectors.easyApplyButtonEnabled) || document.querySelector(selectors.appliedToJobFeedback));

    return hasLoadedStatus && hasLoadedDescription;
  }, {}, selectors);
}

async function getJobCompanyName(searchResultsPage: Page, searchResultListItemIndex: number) {
  return await searchResultsPage.$eval(`${selectors.searchResultListItem}:nth-child(${searchResultListItemIndex + 1}) ${selectors.searchResultListItemCompanyName}`, el => (el as HTMLElement).innerText).catch(() => 'Unknown');
}

async function jobMatchesUserRequirements(page: Page, params: JobSearchParams, title: JobTitle) {
  const jobDescription = await page.$eval(selectors.jobDescription, el => (el as HTMLElement).innerText);
  const canApply = !!(await page.$(selectors.easyApplyButtonEnabled));
  const jobDescriptionLanguage = languageDetector.detect(jobDescription, 1)[0][0];
  const matchesLanguage = params.jobDescriptionLanguages.includes("any") || params.jobDescriptionLanguages.includes(jobDescriptionLanguage);

  const jobTitleRegExp = new RegExp(params.jobTitle, 'i');
  const jobDescriptionRegExp = new RegExp(params.jobDescription, 'i');      
  return canApply && jobTitleRegExp.test(title) && jobDescriptionRegExp.test(jobDescription) && matchesLanguage
}

export default fetchJobLinksAsUser;
