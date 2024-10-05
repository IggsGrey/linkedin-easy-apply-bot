export type WorkplaceType = {
    REMOTE: boolean;
    ON_SITE: boolean;
    HYBRID: boolean;
  };
  
  export type YearsOfExperienceType = {
    [key: string]: number;
  };
  
  export type LanguageProficiencyType = {
    [key: string]: string;
  };
  
  export type ConfigType = {
    // LOGIN DETAILS
    LINKEDIN_EMAIL: string;
    LINKEDIN_PASSWORD: string;
  
    // JOB SEARCH PARAMETERS
    KEYWORDS: string;
    DATE_POSTED: "PAST_24_HOURS" | "PAST_WEEK" | "PAST_MONTH";
    LOCATION: string;
    WORKPLACE: WorkplaceType;
    JOB_TITLE: string;
    JOB_DESCRIPTION: string;
    JOB_DESCRIPTION_LANGUAGES: string[];
  
    // FORM DATA
    PHONE: string;
    CV_PATH: string;
    COVER_LETTER_PATH: string;
    HOME_CITY: string;
    YEARS_OF_EXPERIENCE: YearsOfExperienceType;
    LANGUAGE_PROFICIENCY: LanguageProficiencyType;
    REQUIRES_VISA_SPONSORSHIP: boolean;
    TEXT_FIELDS: { [key: string]: string };
    BOOLEANS: { [key: string]: boolean };
    MULTIPLE_CHOICE_FIELDS: { [key: string]: string };
  
    // OTHER SETTINGS
    SINGLE_PAGE: boolean;
  };