import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { compareJsonAtPath, Difference, isFilePath } from "../support/utilities";
import * as path from 'path';
import * as fs from 'fs';
import { jsonContext, xmlContext } from "../support/contexts";
import { readdir } from "fs";
// import { assert } from "chai";
import assert from 'assert';
import { JSONPath } from "jsonpath-plus";
import { expandVariablesDeepAsString } from "../support/variables";

Given('I set the following keys to be tolerated when compare', async function (table: DataTable) {
  const keys = table.raw().map(row => row[0]);
  jsonContext.setTolerantKeys(keys);
})

When('I load in expected json from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setExpectedJson(expandVariablesDeepAsString(fileContent));
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    jsonContext.setExpectedJson(expandVariablesDeepAsString(source));
  }
})

When('I load in actual json from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setActualJson(expandVariablesDeepAsString(fileContent));
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    jsonContext.setActualJson(expandVariablesDeepAsString(source));
  }
})

Then('I compare the expected and actual json', async function () {
  let expectedJson: string = jsonContext.getExpectedJson();
  let actualJson: string = jsonContext.getActualJson();
  let tolerantKeys: string[] = jsonContext.getTolerantKeys();
  expectedJson = expandVariablesDeepAsString(expectedJson);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));

  const differences = compareJsonAtPath(expectedJson, actualJson, "$.", tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Json matched Actual Json successfully.`);
  } else {
    jsonContext.setJsonDifferences(differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Json Compare failed.")
  }
})

Then('I compare the expected and actual json from a specific json path {string}', async function (jsonPath: string) {
  jsonPath = expandVariablesDeepAsString(jsonPath);
  let expectedJson: string = jsonContext.getExpectedJson();
  let actualJson: string = jsonContext.getActualJson();
  let tolerantKeys: string[] = jsonContext.getTolerantKeys();
  expectedJson = expandVariablesDeepAsString(expectedJson);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));

  const differences = compareJsonAtPath(expectedJson, actualJson, jsonPath, tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Json matched Actual Json successfully.`);
  } else {
    jsonContext.setJsonDifferences(differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Json Compare failed.")
  }
})

// Single json file assert single field value
Then('I assert the actual json under json path {string} to have value {string} with type {string}', async function (jsonPath: string, value: string, type: string) {
  jsonPath = expandVariablesDeepAsString(jsonPath);
  value = expandVariablesDeepAsString(value);
  let actualJson: string = jsonContext.getActualJson();
  const actualNode = JSONPath({ path: jsonPath, json: actualJson }) ?? undefined;
  if (actualNode == undefined) { assert.fail("Values cannot be found. Please check the actual json or the navigate json path ") };
  const typeOfActualValue = typeof actualNode;
  assert.strictEqual(actualNode.toString(), value);
  assert.strictEqual(typeOfActualValue, type);
})

Then('I compare the expected json to jsons in folder {string} from a specific json path {string}', async function (folderPath: string, jsonPath: string) {
  folderPath = expandVariablesDeepAsString(folderPath);
  jsonPath = expandVariablesDeepAsString(jsonPath);
  let expectedJson: string = jsonContext.getExpectedJson();
  let tolerantKeys: string[] = jsonContext.getTolerantKeys();
  expectedJson = expandVariablesDeepAsString(expectedJson);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));

  const cachedActualJsons: Record<string, string> = {};
  // const differences: Difference[][] = [];
  let correctFlag: boolean = false;

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Failed to read directory:', err);
      return;
    }

    files.forEach(file => {
      const fullPath: string = path.join(folderPath, file);
      fs.readFile(fullPath, 'utf-8', (err, data) => {
        if (!err) {
          cachedActualJsons[file] = JSON.stringify(data);
        } else {
          console.error(`Failed to read file: ${fullPath}`, err);
        }
      });
    });
  });

  for (const [_, actualJson] of Object.entries(cachedActualJsons)) {
    const diff = compareJsonAtPath(expectedJson, actualJson, jsonPath, tolerantKeys);
    // differences.push(diff);

    if (diff.length === 0) {
      correctFlag = true;
      console.log(`Expected Json is found matched successfully for file: ${_}`);
      break;
    } else {
      console.log(`Differences caught when compare to ${_}: `);
      console.log(`\r\n`);
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    }
  }

  if (!correctFlag) { assert.fail("Expected Json is not found in preferred dir."); }
})

// Multiple Json files assert single field value
Then('I assert the actual jsons in folder {string} under json path {string} to have value {string} with type {string}', async function (folderPath: string, jsonPath: string, value: string, type: string) {
  folderPath = expandVariablesDeepAsString(folderPath);
  jsonPath = expandVariablesDeepAsString(jsonPath);
  value = expandVariablesDeepAsString(value);
  const cachedActualJsons: Record<string, string> = {};
  // const differences: Difference[][] = [];
  let correctFlag: boolean = false;

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Failed to read directory:', err);
      return;
    }

    files.forEach(file => {
      const fullPath: string = path.join(folderPath, file);
      fs.readFile(fullPath, 'utf-8', (err, data) => {
        if (!err) {
          cachedActualJsons[file] = JSON.stringify(data);
        } else {
          console.error(`Failed to read file: ${fullPath}`, err);
        }
      });
    });
  });

  for (const [_, actualJson] of Object.entries(cachedActualJsons)) {
    let actualNode = JSONPath({ path: jsonPath, json: actualJson }) ?? undefined;
    if (actualNode != undefined) {
      const typeOfActualValue = typeof actualNode;
      if (actualNode.toString() === value && typeOfActualValue === type) {
        correctFlag = true;
        console.log(`Match value found in ${_} under json path ${jsonPath}: ${actualNode}`);
        break;
      }
    };
  }

  if (!correctFlag) { assert.fail("Expected value is not found in preferred dir jsons."); }
})
