import { Then, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { expandVariables } from "../support/variableUtils";
import { FileRepository } from "../support/fileRepo";
import * as path from 'path';
import * as fs from 'fs';
import assert from 'assert';

When('I export data {string} to file path {string}', async function (this: CustomWorld, data: string, filePath: string) {
  filePath = path.resolve(__dirname, expandVariables(this, filePath));
  const repo = new FileRepository(expandVariables(this, data));
  await repo.parseToObject();
  if (filePath.includes(".xlsx")) {
    const bufferXlsx = await repo.exportTo("xlsx");
    fs.writeFileSync(filePath, bufferXlsx);
  } else if (filePath.includes(".csv")) {
    const bufferCsv = await repo.exportTo("csv");
    fs.writeFileSync(filePath, bufferCsv);
  } else if (filePath.includes(".json")) {
    const bufferCsv = await repo.exportTo("json");
    fs.writeFileSync(filePath, bufferCsv);
  } else if (filePath.includes(".xml")) {
    const bufferCsv = await repo.exportTo("xml");
    fs.writeFileSync(filePath, bufferCsv);
  }
})

Then('I compare expected xlsx from file path {string} to actual xlsx from path {string}', async function (this: CustomWorld, filePath1: string, filePath2: string) {
  filePath1 = path.resolve(__dirname, expandVariables(this, filePath1));
  filePath2 = path.resolve(__dirname, expandVariables(this, filePath2));
  const file1 = fs.readFileSync(filePath1);
  const file2 = fs.readFileSync(filePath2);
  const diff = await FileRepository.compare(file1, file2, 'xlsx');
  // console.log('Only in A:', diff.onlyInA);
  // console.log('Only in B:', diff.onlyInB);
  if (diff.length === 0) {
    console.log(`Expected Xlsx matched Actual Xlsx successfully.`);
  } else {
    diff.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Xlsx Compare failed.")
  }
})

Then('I compare expected csv from file path {string} to actual csv from path {string}', async function (this: CustomWorld, filePath1: string, filePath2: string) {
  filePath1 = path.resolve(__dirname, expandVariables(this, filePath1));
  filePath2 = path.resolve(__dirname, expandVariables(this, filePath2));
  const file1 = fs.readFileSync(filePath1);
  const file2 = fs.readFileSync(filePath2);
  const diff = await FileRepository.compare(file1, file2, 'csv');
  // console.log('Only in A:', diff.onlyInA);
  // console.log('Only in B:', diff.onlyInB);
  if (diff.length === 0) {
    console.log(`Expected Csv matched Actual Csv successfully.`);
  } else {
    diff.forEach((diff) => {
      console.log(`-----------------------------------------`);
      console.log(`Differences caught when compare: `);
      console.log(`\r\n`);
      console.log(`${JSON.stringify(diff)}`);
      console.log(`\r\n`);
      console.log(`-----------------------------------------`);
    });
    assert.fail("Csv Compare failed.")
  }
})
