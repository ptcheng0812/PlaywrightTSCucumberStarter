import { Given, When, Then } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { playwrightContext } from '../support/contexts';


Given('I navigate to home page', async function () {
  const page = playwrightContext.getPage();
  await page.goto("https://www.rightmove.co.uk/");
})

When('I search place for sale', async function () {
  const page = playwrightContext.getPage();
  await page.getByTestId("typeahead-searchbox").click();
  await page.getByTestId("typeahead-searchbox").fill("London");
  await page.getByRole('button', { name: 'London', exact: true }).click();
  await page.getByTestId("forSaleCta").click();
  await page.getByText("Find property for sale in London").isVisible({ timeout: 10 });
})
