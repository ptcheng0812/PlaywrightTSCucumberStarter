import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "chai";
// import { connectAndQuery } from "../support/database-client";
import { databaseContext, getGlobalContext, setGlobalContext } from "../support/contexts";
import { expandVariables } from "../support/variableUtils";
import { hashTableTransformed, rowTableTransformed } from "../support/tableUtils";
import { compareRecordArrays, Difference } from "../support/commonUtils";
import assert from 'assert';
import { CustomWorld } from "../support/world";
import { DatabaseRepositoryFactory, IDatabaseRepository } from "../support/databaseRepo";


Given("I connect to the database", async function (this: CustomWorld) {
  // Connection
  // const db: DatabaseConnection = await DatabaseConnection.getInstance();
  const repo: IDatabaseRepository = await DatabaseRepositoryFactory.getRepository();
  databaseContext.setDatabaseRepo(this, repo);
});

When("I run the sql query {string}", async function (this: CustomWorld, query: string) {
  databaseContext.setSqlQuery(this, expandVariables(this, query));
  const repo: IDatabaseRepository = databaseContext.getDatabaseRepo(this);
  const result: any = await repo.query(query);
  databaseContext.setSqlResult(this, result);
});

Then("I assert the following sql", async function (this: CustomWorld, table: DataTable) {
  const expectedSqlT = table.hashes();
  const expectedSqlTransformed: Record<string, any>[] = hashTableTransformed(this, expectedSqlT);
  const tolerantKeys: string[] = databaseContext.getTolerantKeys(this);
  const dbResult: Record<string, any>[] = databaseContext.getSqlResult(this);
  const differences: Difference[] = compareRecordArrays(expectedSqlTransformed, dbResult, tolerantKeys);

  if (differences.length === 0) {
    console.log(`Expected Json matched Actual Json successfully.`);
  } else {
    databaseContext.setSqlDifferences(this, differences);
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
