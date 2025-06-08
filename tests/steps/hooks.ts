import { After, AfterAll, Before, BeforeAll, IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, expect, Page, request as playwrightRequest } from '@playwright/test'
import { playwrightContext } from "../support/contexts";
import * as fs from "fs";
import { ICreateAttachment, ICreateLog, ICreateLink } from "@cucumber/cucumber/lib/runtime/attachment_manager";
import { CustomWorld } from "../support/world";

//TODO: Add APIRequestContext to BeforeAll
//TODO: clean up context and global
Before(async function (this: CustomWorld) {
  // init
  this.request = await playwrightRequest.newContext();
  this.browser = await chromium.launch({ headless: false });
  if (fs.existsSync("authFile.json")) {
    this.browserContext = await this.browser.newContext({ storageState: 'authFile.json' });
  } else {
    this.browserContext = await this.browser.newContext();
  }
  this.page = await this.browserContext.newPage();

  //export auth file session
  if (this.page != null && fs.existsSync("authFile.json") == false) {
    await this.page.goto('https://www.rightmove.co.uk/');
    await this.page.getByRole('button', { name: 'Accept all' }).click();
    await expect(this.page.getByText('believe in finding it with the UK’s largest choice of homesSearch properties for')).toBeVisible();
    await this.page.context().storageState({ path: "authFile.json" });
  }

})

After(async function (this: CustomWorld) {
  await this.page.close();
  await this.browserContext.close();
  await this.browser.close();
})
