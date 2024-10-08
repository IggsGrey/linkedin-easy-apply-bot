import { Page } from 'puppeteer';

import fillMultipleChoiceFields from './fillMultipleChoiceFields';
import fillBoolean from './fillBoolean';
import fillTextFields from './fillTextFields';
import insertHomeCity from './insertHomeCity';
import insertPhone from './insertPhone';
import uncheckFollowCompany from './uncheckFollowCompany';
import uploadDocs from './uploadDocs';
import { ApplicationFormData } from '../apply';
import message from '../utils/message';
import { withPauseCheck } from '../utils/pause';

const noop = () => { };

const fillFields = withPauseCheck(async(page: Page, formData: ApplicationFormData): Promise<void> => {
  await insertHomeCity(page, formData.homeCity).catch(noop);

  await insertPhone(page, formData.phone).catch(noop);

  await uncheckFollowCompany(page);

  await uploadDocs(page, formData.cvPath, formData.coverLetterPath).catch(noop);

  const textFields = {
    ...formData.textFields,
    ...formData.yearsOfExperience,
  };

  await fillTextFields(page, textFields).catch(message);

  const booleans = formData.booleans;

  booleans['sponsorship'] = formData.requiresVisaSponsorship;

  await fillBoolean(page, booleans).catch(message);

  const multipleChoiceFields = {
    ...formData.languageProficiency,
    ...formData.multipleChoiceFields,
  };

  await fillMultipleChoiceFields(page, multipleChoiceFields).catch(message);
})

export default fillFields;
