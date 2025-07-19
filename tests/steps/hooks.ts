import { After, AfterAll, Before, BeforeAll, IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, expect, Page, request as playwrightRequest } from '@playwright/test'
import { databaseContext, mockServerContext, playwrightContext } from "../support/contexts";
import * as fs from "fs";
import { ICreateAttachment, ICreateLog, ICreateLink } from "@cucumber/cucumber/lib/runtime/attachment_manager";
import { GenericContainer, StartedTestContainer, } from 'testcontainers';
import { WireMockRestClient } from 'wiremock-rest-client';
import { CustomWorld } from "../support/world";

// let wiremockContainer: StartedTestContainer;
// let postgresqlContainer: StartedTestContainer;
let baseUrl: string;

setDefaultTimeout(120000);

BeforeAll(async function () {
  //init test wiremockContainer and mock server
  // wiremockContainer = await new GenericContainer('wiremock/wiremock')
  //   .withExposedPorts(8080)
  //   .start();
  // const host = wiremockContainer.getHost();
  // const port = wiremockContainer.getMappedPort(8080);
  // baseUrl = `http://${host}:${port}`;
  // mockServerContext.setWireMockClient(new WireMockRestClient(baseUrl));
  // mockServerContext.setBaseUrl(baseUrl);

  // // int test PostgreSQL container
  // postgresqlContainer = await new GenericContainer('postgres:15')
  //   .withEnvironment({
  //     'POSTGRES_USER': 'testuser',
  //     'POSTGRES_PASSWORD': 'testpass',
  //     'POSTGRES_DB': 'testdb',
  //   })
  //   .withExposedPorts(5432)
  //   .start();
  // const pgHost = postgresqlContainer.getHost();
  // const pgPort = postgresqlContainer.getMappedPort(5432);
  // const pgConnectionUri = `postgresql://testuser:testpass@${pgHost}:${pgPort}/testdb`;
  // databaseContext.setConnectionString(pgConnectionUri);
})


Before({}, async function (this: CustomWorld) {
  // init browser and page
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

AfterAll(async function () {
  // await wiremockContainer.stop();
  // await postgresqlContainer.stop();

})
