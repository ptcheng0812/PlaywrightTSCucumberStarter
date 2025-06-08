import { Then, When } from "@cucumber/cucumber";
import { compareXmlStrings, isFilePath } from "../support/utilities";
import * as path from 'path';
import * as fs from 'fs';
import { xmlContext } from "../support/contexts";
// import { assert } from "chai";
import assert from 'assert';
import { JSONPath } from "jsonpath-plus";
import { XMLParser } from "fast-xml-parser";
import { expandVariables, expandVariablesDeepAsString } from "../support/variables";

When('I load in expected xml from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setExpectedXml(expandVariablesDeepAsString(fileContent));
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    xmlContext.setExpectedXml(expandVariablesDeepAsString(source));
  }
})

When('I load in actual xml from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setActualXml(expandVariablesDeepAsString(fileContent));
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    xmlContext.setActualXml(expandVariablesDeepAsString(source));
  }
})

Then('I compare the expected and actual xml', async function () {
  let expectedXml: string = xmlContext.getExpectedXml();
  let actualXml: string = xmlContext.getActualXml();
  let tolerantKeys: string[] = xmlContext.getTolerantKeys();
  expectedXml = expandVariablesDeepAsString(expectedXml);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));
  const differences = compareXmlStrings(expectedXml, actualXml, "$.", tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Xml matched Actual Xml successfully.`);
  } else {
    xmlContext.setXmlDifferences(differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Xml Compare failed.")
  }
})

Then('I compare the expected and actual xml from a specific xml path {string}', async function (xmlPath: string) {
  xmlPath = expandVariablesDeepAsString(xmlPath);
  let expectedXml: string = xmlContext.getExpectedXml();
  let actualXml: string = xmlContext.getActualXml();
  let tolerantKeys: string[] = xmlContext.getTolerantKeys();
  expectedXml = expandVariablesDeepAsString(expectedXml);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));

  const differences = compareXmlStrings(expectedXml, actualXml, xmlPath, tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Xml matched Actual Xml successfully.`);
  } else {
    xmlContext.setXmlDifferences(differences);
    differences.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Xml Compare failed.")
  }
})

// Single Xml file assert single field value
Then('I assert the actual xml under xml path {string} to have value {string} with type {string}', async function (xmlPath: string, value: string, type: string) {
  xmlPath = expandVariablesDeepAsString(xmlPath);
  value = expandVariablesDeepAsString(value);
  const actualXml: string = xmlContext.getActualXml();
  const parser = new XMLParser({
    ignoreAttributes: false, // allow comparison of attributes
    attributeNamePrefix: '@_' // makes attributes easier to identify
  });
  const actualXmlObj = parser.parse(actualXml);

  const actualNode = JSONPath({ path: xmlPath, json: actualXmlObj }) ?? undefined;
  if (actualNode == undefined) { assert.fail("Values cannot be found. Please check the actual xml or the navigate xml path ") };
  const typeOfActualValue = typeof actualNode;
  assert.strictEqual(actualNode.toString(), value);
  assert.strictEqual(typeOfActualValue, type);
})

Then('I compare the expected xml to xmls in folder {string} from a specific xml path {string}', async function (folderPath: string, xmlPath: string) {
  folderPath = expandVariablesDeepAsString(folderPath);
  xmlPath = expandVariablesDeepAsString(xmlPath);
  let expectedXml: string = xmlContext.getExpectedXml();
  let tolerantKeys: string[] = xmlContext.getTolerantKeys();
  expectedXml = expandVariablesDeepAsString(expectedXml);
  tolerantKeys = tolerantKeys.map(k => expandVariablesDeepAsString(k));

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
      console.log(`${diff.toString}`);
      console.log(`-----------------------------------------`);
    }
  }

  if (!correctFlag) { assert.fail("Expected Xml is not found in preferred dir."); }
})

// Multiple Xml files assert single field value
Then('I assert the actual xmls in folder {string} under xml path {string} to have value {string} with type {string}', async function (folderPath: string, xmlPath: string, value: string, type: string) {
  folderPath = expandVariablesDeepAsString(folderPath);
  xmlPath = expandVariablesDeepAsString(xmlPath);
  value = expandVariablesDeepAsString(value);
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
      const typeOfActualValue = typeof actualNode;
      if (actualNode.toString() === value && typeOfActualValue === type) {
        correctFlag = true;
        console.log(`Match value found in ${_} under json path ${xmlPath}: ${actualNode}`);
        break;
      }
    };
  }

  if (!correctFlag) { assert.fail("Expected value is not found in preferred dir xmls."); }
})
