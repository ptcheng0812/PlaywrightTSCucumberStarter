import { DataTable, Given, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
import { expect } from "chai";

Given('I set the request headers as follow', async function (table: DataTable) {
  const requestHeaders = table.rowsHash();
  requestContext.setRequestHeaders(requestHeaders);
})

Given('I set the request params as follow', async function (table: DataTable) {
  const requestParams = table.rowsHash();
  const requestParamsTransformed: Record<string, string | number | boolean> = Object.fromEntries(Object.entries(requestParams).map(([key, value]) => {
    if (value === "true") return [key, true];
    if (value === "false") return [key, false];

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed.toString() === value.trim()) {
      return [key, parsed];
    }

    return [key, value];
  }));
  requestContext.setRequestParams(requestParamsTransformed);
})

Given('I set the request form as follow', async function (table: DataTable) {
  const requestForm = table.rowsHash();
  const requestFormTransformed: Record<string, string | number | boolean> = Object.fromEntries(Object.entries(requestForm).map(([key, value]) => {
    if (value === "true") return [key, true];
    if (value === "false") return [key, false];

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed.toString() === value.trim()) {
      return [key, parsed];
    }

    return [key, value];
  }));
  requestContext.setRequestForm(requestFormTransformed);
})

When('I send GET request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams() || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm() || undefined;
  const response = await this.request.get(url, {
    headers: headers ,
    params:params,
    form: form
  });
  expect(response.status()).to.equal(200);
  responseContext.setResponse(response);

  try {
    const data = await response.json() || undefined;
    if (data != undefined && typeof data == 'object') {
      responseContext.setResponseJson(data);
    }
  } catch (error) {
    console.log("Serialization Exception: ", error);
  }
})
