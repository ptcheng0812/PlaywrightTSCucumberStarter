import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { ICreateAttachment, ICreateLog, ICreateLink } from "@cucumber/cucumber/lib/runtime/attachment_manager";
import { APIRequestContext, APIResponse, Browser, BrowserContext, chromium, Page } from "@playwright/test";
import { WireMockRestClient } from "wiremock-rest-client";

export class CustomWorld implements World {
  browser!: Browser;
  browserContext!: BrowserContext;
  page!: Page;
  request!: APIRequestContext;
  response!: APIResponse;
  wiremock!: WireMockRestClient;
  context!: Record<string, any>;
  attach: ICreateAttachment;
  log: ICreateLog;
  link: ICreateLink;
  parameters: any;

  constructor(options: IWorldOptions) {
    this.attach = options.attach;
    this.log = options.log;
    this.link = options.link;
    this.parameters = options.parameters;
    this.context = {};
  }

  setW<T>(key: string, value: T) {
    this.context[key] = value;
  }

  getW<T>(key: string): T {
    return this.context[key] as T;
  }

  // async init() {
  //   this.browser = await chromium.launch({ headless: true });
  //   this.page = await this.browser.newPage();
  // }
}

setWorldConstructor(CustomWorld);
