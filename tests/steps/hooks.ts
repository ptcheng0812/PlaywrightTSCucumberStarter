import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, expect, Page } from '@playwright/test'
import { playwrightContext } from "../support/contexts";
import * as fs from "fs";

BeforeAll(async () => {
  // init
  const browser = await chromium.launch({ headless: false });
  let browserContext = null;
  if (fs.existsSync("authFile.json")) {
    browserContext = await browser.newContext({ storageState: 'authFile.json' });
  } else {
    browserContext = await browser.newContext();
  }
  const page = browserContext ? await browserContext.newPage() : null;

  //export auth file session
  if (page != null && fs.existsSync("authFile.json") == false) {
    await page.goto('https://www.rightmove.co.uk/');
    await page.getByRole('button', { name: 'Accept all' }).click();
    await expect(page.getByText('believe in finding itwith the UK’s largest choice of homesSearch properties for')).toBeVisible();
    await page.context().storageState({ path: "authFile.json" });
  }

  // Store in context object
  if (browser != null && browserContext != null && page != null) {
    playwrightContext.setBrowser(browser);
    playwrightContext.setBrowserContext(browserContext);
    playwrightContext.setPage(page);
  }

})

AfterAll(async () => {
  await playwrightContext.getPage().close()
  await playwrightContext.getBrowserContext().close()
  await playwrightContext.getBrowser().close()
})
