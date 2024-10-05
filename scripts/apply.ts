import puppeteer, { Page } from "puppeteer";
import config from "../config";

import message from "../utils/message";
import logIntoLinkedin from "../login";
import applyToJob, { ApplicationFormData } from "../apply";
import fetchJobLinksAsUser, { DatePosted, JobSearchParams } from "../fetch/fetchJobLinksUser";
import { ConfigType } from "../types/configTypes";
import { pauseIfTheUserPressesEnter } from "../utils/pause";

(async () => {
  pauseIfTheUserPressesEnter();

  const browser = await getBrowserContext()
  const jobListingsPage = await browser.newPage();

  await logIntoLinkedin({
    page: jobListingsPage,
    email: config.LINKEDIN_EMAIL,
    password: config.LINKEDIN_PASSWORD
  });

  const linkGenerator = fetchJobLinksAsUser(jobListingsPage, getJobSearchParamsFromConfig(config));

  let jobApplicationPage: Page | null = null;

  for await (const [link, title, companyName] of linkGenerator) {
    if (!jobApplicationPage || process.env.SINGLE_PAGE !== "true")
      jobApplicationPage = await browser.newPage();

    await jobApplicationPage.bringToFront();

    try {
      await applyToJob({
        page: jobApplicationPage,
        link,
        formData: getApplicationFormDataFromConfig(config),
        shouldSubmit: process.argv[2] === "SUBMIT",
      });

      message(`Applied to ${title} at ${companyName}`);
    } catch(e) {
      message(e as Error);
      message(`Error applying to ${title} at ${companyName}`);
    }

    await jobListingsPage.bringToFront();
  }
})();

async function getBrowserContext() {
    const browserApp = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ["--disable-setuid-sandbox", "--no-sandbox",]
    });
    const context = await browserApp.createIncognitoBrowserContext();
    const pages = await browserApp.pages();
    await pages[0].close();  // I think this closes the default non-incognito browser window.
    return context
}

function getJobSearchParamsFromConfig(config: ConfigType): JobSearchParams {
  return {
    location: config.LOCATION,
    keywords: config.KEYWORDS,
    datePosted: config.DATE_POSTED as DatePosted,
    workplace: {
      remote: config.WORKPLACE.REMOTE,
      onSite: config.WORKPLACE.ON_SITE,
      hybrid: config.WORKPLACE.HYBRID,
    },
    jobTitle: config.JOB_TITLE,
    jobDescription: config.JOB_DESCRIPTION,
    jobDescriptionLanguages: config.JOB_DESCRIPTION_LANGUAGES
  };
}

function getApplicationFormDataFromConfig(config: ConfigType): ApplicationFormData {
  return {
        phone: config.PHONE,
        cvPath: config.CV_PATH,
        homeCity: config.HOME_CITY,
        coverLetterPath: config.COVER_LETTER_PATH,
        yearsOfExperience: config.YEARS_OF_EXPERIENCE,
        languageProficiency: config.LANGUAGE_PROFICIENCY,
        requiresVisaSponsorship: config.REQUIRES_VISA_SPONSORSHIP,
        booleans: config.BOOLEANS,
        textFields: config.TEXT_FIELDS,
        multipleChoiceFields: config.MULTIPLE_CHOICE_FIELDS,
  };
}
