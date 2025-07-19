import { Then, When } from "@cucumber/cucumber";
import { compareXmlStrings, isFilePath } from "../support/commonUtils";
import * as path from 'path';
import * as fs from 'fs';
import { xmlContext } from "../support/contexts";
// import { assert } from "chai";
import assert from 'assert';
import { JSONPath } from "jsonpath-plus";
import { XMLParser } from "fast-xml-parser";
import { expandVariables } from "../support/variableUtils";
import { CustomWorld } from '../support/world';

When('I load in expected xml from {string}', async function (this: CustomWorld, source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setExpectedXml(this, expandVariables(this, fileContent));
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    xmlContext.setExpectedXml(this, expandVariables(this, source));
  }
})

When('I load in actual xml from {string}', async function (this: CustomWorld, source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setActualXml(this, expandVariables(this, fileContent));
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    xmlContext.setActualXml(this, expandVariables(this, source));
  }
})

Then('I compare the expected and actual xml', async function (this: CustomWorld,) {
  let expectedXml: string = xmlContext.getExpectedXml(this);
  let actualXml: string = xmlContext.getActualXml(this);
  let tolerantKeys: string[] = xmlContext.getTolerantKeys(this) ?? [];
  expectedXml = expandVariables(this, expectedXml);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;
  const differences = compareXmlStrings(expectedXml, actualXml, "$.", tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Xml matched Actual Xml successfully.`);
  } else {
    xmlContext.setXmlDifferences(this, differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Xml Compare failed.")
  }
})

Then('I compare the expected and actual xml from a specific xml path {string}', async function (this: CustomWorld, xmlPath: string) {
  xmlPath = expandVariables(this, xmlPath);
  let expectedXml: string = xmlContext.getExpectedXml(this);
  let actualXml: string = xmlContext.getActualXml(this);
  let tolerantKeys: string[] = xmlContext.getTolerantKeys(this) ?? [];
  expectedXml = expandVariables(this, expectedXml);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;

  const differences = compareXmlStrings(expectedXml, actualXml, xmlPath, tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Xml matched Actual Xml successfully.`);
  } else {
    xmlContext.setXmlDifferences(this, differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Xml Compare failed.")
  }
})

// Single Xml file assert single field value
Then('I assert the actual xml under xml path {string} to have value {string} with type {string}', async function (this: CustomWorld, xmlPath: string, value: string, type: string) {
  xmlPath = expandVariables(this, xmlPath);
  value = expandVariables(this, value);
  const actualXml: string = xmlContext.getActualXml(this);
  const parser = new XMLParser({
    ignoreAttributes: false, // allow comparison of attributes
    attributeNamePrefix: '@_' // makes attributes easier to identify
  });
  const actualXmlObj = parser.parse(actualXml);

  const actualNode = JSONPath({ path: xmlPath, json: actualXmlObj }) ?? undefined;
  if (actualNode == undefined) { assert.fail("Values cannot be found. Please check the actual xml or the navigate xml path ") };
  const actual = actualNode[0];
  const typeOfActualValue = typeof actual;
  assert.strictEqual(actual.toString(), value);
  assert.strictEqual(typeOfActualValue, type);
})

Then('I compare the expected xml to xmls in folder {string} from a specific xml path {string}', async function (this: CustomWorld, folderPath: string, xmlPath: string) {
  folderPath = expandVariables(this, folderPath);
  xmlPath = expandVariables(this, xmlPath);
  let expectedXml: string = xmlContext.getExpectedXml(this);
  let tolerantKeys: string[] = xmlContext.getTolerantKeys(this) ?? [];
  expectedXml = expandVariables(this, expectedXml);
  tolerantKeys = tolerantKeys.length > 0 ? tolerantKeys.map(k => expandVariables(this, k)) : tolerantKeys;

  const cachedActualXmls: Record<string, string> = {};
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
          cachedActualXmls[file] = data.toString();
        } else {
          console.error(`Failed to read file: ${fullPath}`, err);
        }
      });
    });
  });

  for (const [_, actualXml] of Object.entries(cachedActualXmls)) {
    const diff = compareXmlStrings(expectedXml, actualXml, xmlPath, tolerantKeys);
    // differences.push(diff);

    if (diff.length === 0) {
      correctFlag = true;
      console.log(`Expected Xml is found matched successfully for file: ${_}`);
      break;
    } else {
      console.log(`Differences caught when compare to ${_}: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    }
  }

  if (!correctFlag) { assert.fail("Expected Xml is not found in preferred dir."); }
})

// Multiple Xml files assert single field value
Then('I assert the actual xmls in folder {string} under xml path {string} to have value {string} with type {string}', async function (this: CustomWorld, folderPath: string, xmlPath: string, value: string, type: string) {
  folderPath = expandVariables(this, folderPath);
  xmlPath = expandVariables(this, xmlPath);
  value = expandVariables(this, value);
  const cachedActualXmls: Record<string, string> = {};
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
          cachedActualXmls[file] = data.toString();
        } else {
          console.error(`Failed to read file: ${fullPath}`, err);
        }
      });
    });
  });

  for (const [_, actualXml] of Object.entries(cachedActualXmls)) {
    const parser = new XMLParser({
      ignoreAttributes: false, // allow comparison of attributes
      attributeNamePrefix: '@_' // makes attributes easier to identify
    });
    const actualXmlObj = parser.parse(actualXml);
    let actualNode = JSONPath({ path: xmlPath, json: actualXmlObj }) ?? undefined;
    if (actualNode != undefined) {
      const actual = actualNode[0];
      const typeOfActualValue = typeof actual;
      if (actual.toString() === value && typeOfActualValue === type) {
        correctFlag = true;
        console.log(`Match value found in ${_} under json path ${xmlPath}: ${actual}`);
        break;
      }
    };
  }

  if (!correctFlag) { assert.fail("Expected value is not found in preferred dir xmls."); }
})
