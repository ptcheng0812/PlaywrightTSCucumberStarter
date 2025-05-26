import { DataTable, Given, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
import { expect } from "chai";
import { APIResponse } from "@playwright/test";
import { Serializable } from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import { inferAndCastAndAssignJson, isJsonString } from "../support/utilities";
import { XMLBuilder } from "fast-xml-parser";

/********Set Request steps*******************
  data?: string | Buffer | Serializable;
  form?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  failOnStatusCode?: boolean;
  ignoreHTTPSErrors?: boolean;
  maxRedirects?: number;
  maxRetries?: number;
  timeout?: number;

 *******************************/
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

Given('I set the request if fail-on statuscode {string}', async function (flag: string) {
  const failOnStatusCode: boolean = (flag == "true" || flag == "True");
  requestContext.setRequestFailOnStatusCode(failOnStatusCode);
})

Given('I set the request if ignore Https errors {string}', async function (flag: string) {
  const ignoreHTTPSErrors: boolean = (flag == "true" || flag == "True");
  requestContext.setRequestIgnoreHTTPSErrors(ignoreHTTPSErrors);
})

Given('I set the request max redirects as {string}', async function (max: string) {
  const maxRedirects: number = parseInt(max);
  requestContext.setRequestMaxRedirects(maxRedirects);
})

Given('I set the request max retries as {string}', async function (max: string) {
  const maxRetries: number = parseInt(max);
  requestContext.setRequestMaxRetries(maxRetries);
})

Given('I set the request timeout as {string}', async function (timeO: string) {
  const timeout: number = parseInt(timeO);
  requestContext.setRequestTimeout(timeout);
})

Given('I set the request method as {string}', async function (method: string) {
  requestContext.setRequestMethod(method);
})

/********Variations to set Request Body steps (simple string, from file, as follow table)*******/
Given('I set the request data as string {string}', async function (body: string) {
  requestContext.setRequestData(body);
})

Given('I set the request data from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    requestContext.setRequestData(fileContent);
  }
})

Given('I set the request data as follow to {string}', async function (table: DataTable, format: string) {
  const requestBody = table.hashes();
  //TODO: Transform logic need to be improve
  const requestDataTransformed: Record<string, string>[] = requestBody.map((b) => {
    return Object.fromEntries(Object.entries(b).map(([key, value]) => {
      if (value === "true") return [key, true];
      if (value === "false") return [key, false];

      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed.toString() === value.trim()) {
        return [key, parsed];
      }

      return [key, value];
    }));
  })
  let requestDataStringFormatted: string = "";
  if (format in ["json", "JSON", "Json"]) {
    requestDataStringFormatted = requestDataTransformed.length === 1 ? JSON.stringify(requestDataTransformed[0]) : JSON.stringify(requestDataTransformed)
  } else if (format in ["xml", "XML", "Xml"]) {
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false
    });
    requestDataStringFormatted = requestDataTransformed.length === 1 ? builder.build(requestDataTransformed[0]) : builder.build(requestDataTransformed);
  }
  requestContext.setRequestData(requestDataStringFormatted);
})

When('I amend the request data where key {string} to be {string}', async function (keyToAmend: string, valueToAmend: string) {
  const originalRequestData = requestContext.getRequestData();
  if (isJsonString(originalRequestData) && originalRequestData != null && originalRequestData != undefined) {
    const amendedJson: string = JSON.stringify(inferAndCastAndAssignJson(originalRequestData, keyToAmend, valueToAmend));
    requestContext.setRequestData(amendedJson);
  }
})

/***************Set Response steps*********************
body?: string | Buffer;
contentType?: string;
headers?: {[key: string]: string;};
json?: Serializable;
path?: string;
response?: APIResponse;
status?: number;
************************************/

Given('I set the response content type as {string}', async function (contentType: string) {
  responseContext.setResponseContentType(contentType);
})

Given('I set the response content type as {string}', async function (contentType: string) {
  responseContext.setResponseContentType(contentType);
})

Given('I set the response headers as follow', async function (table: DataTable) {
  const responseHeaders = table.rowsHash();
  responseContext.setResponseHeaders(responseHeaders);
})

Given('I set the response path content as {string}', async function (path: string) {
  responseContext.setResponsePath(path);
})

Given('I set the response status content as {string}', async function (statusInString: string) {
  try {
    const status: number = parseInt(statusInString);
    responseContext.setResponseStatus(status);
  } catch (error) {
    console.log('Failed tp set Response status: ', error);
  }
})

/********Variations to set Response Body and JSON steps (simple string, from file, as follow table)*******/
Given('I set the response body as string {string}', async function (body: string) {
  responseContext.setResponseBody(body);
})

Given('I set the response json as string {string}', async function (json: string) {
  responseContext.setResponseJson(json);
})

Given('I set the response body from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseBody(fileContent);
  }
})

Given('I set the response json from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseJson(fileContent);
  }
})

Given('I set the response body as follow to {string}', async function (table: DataTable, format: string) {
  const responseBody: Record<string, string>[] = table.hashes();
  //TODO: Transform logic need to be improve
  const responseBodyTransformed: Record<string, string>[] = responseBody.map((b) => {
    return Object.fromEntries(Object.entries(b).map(([key, value]) => {
      if (value === "true") return [key, true];
      if (value === "false") return [key, false];

      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed.toString() === value.trim()) {
        return [key, parsed];
      }

      return [key, value];
    }));
  })
  let responseBodyStringFormatted: string = "";
  if (format in ["json", "JSON", "Json"]) {
    responseBodyStringFormatted = responseBodyTransformed.length === 1 ? JSON.stringify(responseBodyTransformed[0]) : JSON.stringify(responseBodyTransformed);
  } else if (format in ["xml", "XML", "Xml"]) {
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false
    });
    responseBodyStringFormatted = responseBodyTransformed.length === 1 ? builder.build(responseBodyTransformed[0]) : builder.build(responseBodyTransformed);
  }
  responseContext.setResponseBody(responseBodyStringFormatted);
})

Given('I set the response json as follow', async function (table: DataTable) {
  const responseJson: Record<string, string>[] = table.hashes();
  //TODO: Transform logic need to be improve
  const responseJsonTransformed: Record<string, string>[] = responseJson.map((b) => {
    return Object.fromEntries(Object.entries(b).map(([key, value]) => {
      if (value === "true") return [key, true];
      if (value === "false") return [key, false];

      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed.toString() === value.trim()) {
        return [key, parsed];
      }

      return [key, value];
    }));
  })
  const responseJSONString: string = responseJsonTransformed.length === 1 ? JSON.stringify(responseJsonTransformed[0]) : JSON.stringify(responseJsonTransformed)
  responseContext.setResponseJson(responseJSONString);
})

When('I amend the response json where key {string} to be {string}', async function (keyToAmend: string, valueToAmend: string) {
  const originalResponseJson = responseContext.getResponseJson();

  if (isJsonString(originalResponseJson) && originalResponseJson != null && originalResponseJson != undefined) {
    const amendedRespJson: string = JSON.stringify(inferAndCastAndAssignJson(originalResponseJson, keyToAmend, valueToAmend));
    responseContext.setResponseJson(amendedRespJson);
  }
})

/***************API Actions GET, POST, PUT, DELETE */
When('I send GET request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams() || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm() || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode() || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors() || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects() || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries() || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout() || undefined;
  const response: APIResponse = await this.request.get(url, {
    headers: headers,
    params: params,
    form: form,
    failOnStatusCode: failOnStatusCode,
    ignoreHTTPSErrors: ignoreHTTPSErrors,
    maxRedirects: maxRedirects,
    maxRetries: maxRetries,
    timeout: timeout
  });
  expect(response.status()).to.equal(200);
  this.response = response;

  const respData: Promise<Serializable> = await response.json() || undefined;
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (respData != undefined && isJsonString((await respData).toString())) {
      responseContext.setResponseJson((await respData).toString());
    } else {
      console.log("WARNING: No response json returned and stored in context")
    }
  } catch (error) {
    console.log("JSON Serialization Exception: ", error);
  }
})

When('I send POST request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams() || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm() || undefined;
  const data: string | number | bigint | true | object | undefined = requestContext.getRequestData() || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode() || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors() || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects() || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries() || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout() || undefined;
  const response: APIResponse = await this.request.post(url, {
    data: data,
    headers: headers,
    params: params,
    form: form,
    failOnStatusCode: failOnStatusCode,
    ignoreHTTPSErrors: ignoreHTTPSErrors,
    maxRedirects: maxRedirects,
    maxRetries: maxRetries,
    timeout: timeout
  });
  expect(response.status()).to.equal(200);
  this.response = response;

  const respData: Promise<Serializable> = await response.json() || undefined;
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (respData != undefined && isJsonString((await respData).toString())) {
      responseContext.setResponseJson((await respData).toString());
    } else {
      console.log("WARNING: No response json returned and stored in context")
    }
  } catch (error) {
    console.log("JSON Serialization Exception: ", error);
  }
})
