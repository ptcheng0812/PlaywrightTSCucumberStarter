import { When } from "@cucumber/cucumber";
import { compareXmlStrings, isFilePath } from "../support/utilities";
import * as path from 'path';
import * as fs from 'fs';
import { xmlContext } from "../support/contexts";

When('I load in expected xml from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setExpectedXml(fileContent);
    } else {
      console.error('Source expected json file is not found in system');
    }
  } else {
    xmlContext.setExpectedXml(source);
  }
})

When('I load in actual xml from {string}', async function (source: string) {
  if (isFilePath(source)) {
    const filePath = path.resolve(__dirname, source);
    if (fs.existsSync(filePath)) {
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');
      xmlContext.setActualXml(fileContent);
    } else {
      console.error('Source actual json file is not found in system');
    }
  } else {
    xmlContext.setActualXml(source);
  }
})

When('I compare the expected and actual xml', async function () {
  const expectedXml: string = xmlContext.getExpectedXml();
  const actualXml: string = xmlContext.getActualXml();
  const tolerantKeys: string[] = xmlContext.getTolerantKeys();
  const differences = compareXmlStrings(expectedXml, actualXml, "$.", tolerantKeys);
  xmlContext.setXmlDifferences(differences);
})

When('I compare the expected and actual xml from a specific xml path {string}', async function (xmlPath: string) {
  const expectedXml: string = xmlContext.getExpectedXml();
  const actualXml: string = xmlContext.getActualXml();
  const tolerantKeys: string[] = xmlContext.getTolerantKeys();
  const differences = compareXmlStrings(expectedXml, actualXml, xmlPath, tolerantKeys);
  xmlContext.setXmlDifferences(differences);
})
