import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { playwrightContext } from '../support/contexts';
import { CustomWorld } from '../support/world';


Given('I navigate to home page', { timeout: 60000 }, async function (this: CustomWorld) {
  await this.page.goto("https://www.rightmove.co.uk/");
})

When('I search place for sale', { timeout: 60000 }, async function (this: CustomWorld) {
  await this.page.getByTestId("typeahead-searchbox").click();
  await this.page.getByTestId("typeahead-searchbox").fill("London");
  await this.page.getByRole('button', { name: 'London', exact: true }).click();
  await this.page.getByTestId("forSaleCta").click();
  await this.page.getByText("Find property for sale in London").isVisible({ timeout: 10 });
})

When('I visit commercial-property page and assert mock locator', async function (this: CustomWorld) {
  await this.page.goto("https://www.rightmove.co.uk/commercial-property");
  await expect(this.page.locator('#mock-content')).toHaveText('This is a mocked HTML response');
})
