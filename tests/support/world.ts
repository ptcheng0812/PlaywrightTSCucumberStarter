import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { ICreateAttachment, ICreateLog, ICreateLink } from "@cucumber/cucumber/lib/runtime/attachment_manager";
import { APIRequestContext, APIResponse, Browser, BrowserContext, chromium, Page } from "@playwright/test";

export class CustomWorld implements World {
  browser!: Browser;
  browserContext!: BrowserContext;
  page!: Page;
  request!: APIRequestContext;
  response!: APIResponse;
  attach: ICreateAttachment;
  log: ICreateLog;
  link: ICreateLink;
  parameters: any;

  constructor(options: IWorldOptions) {
    this.attach = options.attach;
    this.log = options.log;
    this.link = options.link;
    this.parameters = options.parameters;
  }

  // async init() {
  //   this.browser = await chromium.launch({ headless: true });
  //   this.page = await this.browser.newPage();
  // }
}

setWorldConstructor(CustomWorld);
