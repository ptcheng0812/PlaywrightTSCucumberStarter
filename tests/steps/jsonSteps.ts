import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { compareJsonAtPath, Difference, isFilePath } from "../support/commonUtils";
import * as path from 'path';
import * as fs from 'fs';
import { jsonContext, xmlContext } from "../support/contexts";
import { readdir } from "fs";
// import { assert } from "chai";
import assert from 'assert';
import { JSONPath } from "jsonpath-plus";
import { expandVariables } from "../support/variableUtils";
import { CustomWorld } from "../support/world";

Given('I set the following keys to be tolerated when compare', async function (this: CustomWorld, table: DataTable) {
  const keys = table.raw().map(row => row[0]);
  jsonContext.setTolerantKeys(this, keys);
})

When('I load in expected json from {string}', async function (this: CustomWorld, source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setExpectedJson(this, expandVariables(this, fileContent));
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    jsonContext.setExpectedJson(this, expandVariables(this, source));
  }
})

When('I load in actual json from {string}', async function (this: CustomWorld, source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      jsonContext.setActualJson(this, expandVariables(this, fileContent));
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    jsonContext.setActualJson(this, expandVariables(this, source));
  }
  // console.log("actualJson------------>: " + jsonContext.getActualJson(this, ));
})

Then('I compare the expected and actual json', async function (this: CustomWorld,) {
  let expectedJson: string = jsonContext.getExpectedJson(this,);
  let actualJson: string = jsonContext.getActualJson(this,);
  let tolerantKeys: string[] = jsonContext.getTolerantKeys(this,) ?? [];
  expectedJson = expandVariables(this, expectedJson);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;

  const differences = compareJsonAtPath(expectedJson, actualJson, "$.", tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Json matched Actual Json successfully.`);
  } else {
    jsonContext.setJsonDifferences(this, differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Json Compare failed.")
  }
})

Then('I compare the expected and actual json from a specific json path {string}', async function (this: CustomWorld, jsonPath: string) {
  jsonPath = expandVariables(this, jsonPath);
  let expectedJson: string = jsonContext.getExpectedJson(this,);
  let actualJson: string = jsonContext.getActualJson(this,);
  let tolerantKeys: string[] = jsonContext.getTolerantKeys(this,) ?? [];
  expectedJson = expandVariables(this, expectedJson);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;

  const differences = compareJsonAtPath(expectedJson, actualJson, jsonPath, tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Json matched Actual Json successfully.`);
  } else {
    jsonContext.setJsonDifferences(this, differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Json Compare failed.")
  }
})

// Single json file assert single field value
Then('I assert the actual json under json path {string} to have value {string} with type {string}', async function (this: CustomWorld, jsonPath: string, value: string, type: string) {
  jsonPath = expandVariables(this, jsonPath);
  value = expandVariables(this, value);
  let actualJson: string = jsonContext.getActualJson(this,);
  let actualObj: any = JSON.parse(actualJson);
  const actualNode = JSONPath({ path: jsonPath, json: actualObj }) ?? undefined;
  if (actualNode == undefined) { assert.fail("Values cannot be found. Please check the actual json or the navigate json path ") };
  const actual = actualNode[0];
  const typeOfActualValue = typeof actual;
  assert.strictEqual(actual.toString(), value);
  assert.strictEqual(typeOfActualValue, type);
})

Then('I compare the expected json to jsons in folder {string} from a specific json path {string}', async function (this: CustomWorld, folderPath: string, jsonPath: string) {
  folderPath = expandVariables(this, folderPath);
  jsonPath = expandVariables(this, jsonPath);
  let expectedJson: string = jsonContext.getExpectedJson(this,);
  let tolerantKeys: string[] = jsonContext.getTolerantKeys(this,) ?? [];
  expectedJson = expandVariables(this, expectedJson);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;

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
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    }
  }

  if (!correctFlag) { assert.fail("Expected Json is not found in preferred dir."); }
})

// Multiple Json files assert single field value
Then('I assert the actual jsons in folder {string} under json path {string} to have value {string} with type {string}', async function (this: CustomWorld, folderPath: string, jsonPath: string, value: string, type: string) {
  folderPath = expandVariables(this, folderPath);
  jsonPath = expandVariables(this, jsonPath);
  value = expandVariables(this, value);
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
    let actualObj = JSON.parse(actualJson);
    let actualNode = JSONPath({ path: jsonPath, json: actualObj }) ?? undefined;
    if (actualNode != undefined) {
      const actual = actualNode[0];
      const typeOfActualValue = typeof actual;
      if (actual.toString() === value && typeOfActualValue === type) {
        correctFlag = true;
        console.log(`Match value found in ${_} under json path ${jsonPath}: ${actual}`);
        break;
      }
    };
  }

  if (!correctFlag) { assert.fail("Expected value is not found in preferred dir jsons."); }
})
