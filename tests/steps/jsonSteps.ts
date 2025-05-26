import { DataTable, Given, When } from "@cucumber/cucumber";
import { compareJsonAtPath, isFilePath } from "../support/utilities";
import * as path from 'path';
import * as fs from 'fs';
import { jsonContext } from "../support/contexts";

Given('I set the following keys to be tolerated when compare', async function (table: DataTable) {
  const keys = table.raw().map(row => row[0]);
  jsonContext.setTolerantKeys(keys);
})

When('I load in expected json from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setExpectedJson(fileContent);
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    jsonContext.setExpectedJson(source);
  }
})

When('I load in actual json from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setActualJson(fileContent);
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    jsonContext.setActualJson(source);
  }
})

When('I compare the expected and actual json', async function () {
  const expectedJson: string = jsonContext.getExpectedJson();
  const actualJson: string = jsonContext.getActualJson();
  const tolerantKeys: string[] = jsonContext.getTolerantKeys();
  const differences = compareJsonAtPath(expectedJson, actualJson, "$.", tolerantKeys);
  jsonContext.setJsonDifferences(differences);
})

When('I compare the expected and actual json from a specific json path {string}', async function (jsonPath: string) {
  const expectedJson: string = jsonContext.getExpectedJson();
  const actualJson: string = jsonContext.getActualJson();
  const tolerantKeys: string[] = jsonContext.getTolerantKeys();
  const differences = compareJsonAtPath(expectedJson, actualJson, jsonPath, tolerantKeys);
  jsonContext.setJsonDifferences(differences);
})
