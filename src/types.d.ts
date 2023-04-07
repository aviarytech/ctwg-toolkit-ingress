// Interface for the command line arguments
export interface ICLA {
  config: string;
  token: string;
  verbose: boolean;
  term: string;
  termType?: string;
  isa?: string;
  glossaryText: string;
  synonymOf: string;
  groupTags: string;
  formPhrases: string;
  status: string;
  created: string;
  updated: string;
  contributors: string;
  attribution: string;
  originalLicense: string;
}

// Options to pass to the GitHub API to get the wiki pages
export interface IWikiPage {
  name: string;
  path: string;
  sha: string;
  url: string;
}
