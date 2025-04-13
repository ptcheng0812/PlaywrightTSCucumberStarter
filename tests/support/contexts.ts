import { Browser, BrowserContext, Page } from "@playwright/test";

let browser: Browser;
let browserContext: BrowserContext;
let page: Page;

export const playwrightContext = {
  getBrowser: () => browser,
  setBrowser: (b: Browser) => (browser = b),

  getBrowserContext: () => browserContext,
  setBrowserContext: (bC: BrowserContext) => (browserContext = bC),

  getPage: () => page,
  setPage: (p: Page) => (page = p),
};
