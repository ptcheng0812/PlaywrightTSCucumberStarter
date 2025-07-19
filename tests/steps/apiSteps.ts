import { DataTable, Given, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
// import { expect } from "chai";
import { APIResponse } from "@playwright/test";
import { Serializable } from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import { inferAndCastAndAssignJson, inferAndCastAndAssignXml, isJsonString, isXmlString } from "../support/commonUtils";
import { XMLBuilder } from "fast-xml-parser";
import { hashTableTransformed, rowTableTransformed } from "../support/tableUtils";
import assert from "assert";
import { expandVariables } from "../support/variableUtils";

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
Given('I set the request headers as follow', async function (this: CustomWorld, table: DataTable) {
  const requestHeaders = table.rowsHash();
  const requestHeadersTransformed: Record<string, any> = rowTableTransformed(this, requestHeaders)
  requestContext.setRequestHeaders(this, requestHeadersTransformed);
})

Given('I set the request params as follow', async function (this: CustomWorld, table: DataTable) {
  const requestParams = table.rowsHash();
  const requestParamsTransformed: Record<string, any> = rowTableTransformed(this, requestParams);
  requestContext.setRequestParams(this, requestParamsTransformed);
})

Given('I set the request cookies as follow', async function (this: CustomWorld, table: DataTable) {
  const requestCookies = table.rowsHash();
  const requestCookiesTransformed: Record<string, any> = rowTableTransformed(this, requestCookies);
  requestContext.setRequestCookies(this, requestCookiesTransformed);
})

Given('I set the request http auth credentials as follow', async function (this: CustomWorld, table: DataTable) {
  const requestAuth = table.rowsHash();
  const requestAuthTransformed: { [k: string]: any; password: string; username: string; } = Object.fromEntries(Object.entries(requestAuth).map(([key, value]) => {
    value = expandVariables(this, value.trim());

    if (value === "true" || value === "True" || value === "TRUE") return [key, true];
    if (value === "false" || value === "False" || value === "FALSE") return [key, false];

    if (key === 'username' || key === 'password') {
      return [key, value]; // ensure string
    }

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return [key, parsed];
    }

    if (/^null$/i.test(value)) return [key, null];

    try {
      const parsedJson = JSON.parse(value);
      return [key, parsedJson];
    } catch {
      // Ignore JSON parse errors, fall through to return as string
    }

    return [key, value];
  })) as {
    [k: string]: any;
    password: string;
    username: string;
  };

  requestContext.setBasicHttpAuthCredentials(this, requestAuthTransformed);
})


Given('I set the request form as follow', async function (this: CustomWorld, table: DataTable) {
  const requestForm = table.rowsHash();
  const requestFormTransformed: Record<string, string | number | boolean> = rowTableTransformed(this, requestForm);
  requestContext.setRequestForm(this, requestFormTransformed);
})

Given('I set the request if fail-on statuscode {string}', async function (this: CustomWorld, flag: string) {
  flag = expandVariables(this, flag);
  const failOnStatusCode: boolean = (flag == "true" || flag == "True" || flag == "TRUE");
  requestContext.setRequestFailOnStatusCode(this, failOnStatusCode);
})

Given('I set the request if ignore Https errors {string}', async function (this: CustomWorld, flag: string) {
  flag = expandVariables(this, flag);
  const ignoreHTTPSErrors: boolean = (flag == "true" || flag == "True" || flag == "TRUE");
  requestContext.setRequestIgnoreHTTPSErrors(this, ignoreHTTPSErrors);
})

Given('I set the request max redirects as {string}', async function (this: CustomWorld, max: string) {
  max = expandVariables(this, max);
  const maxRedirects: number = parseInt(max);
  requestContext.setRequestMaxRedirects(this, maxRedirects);
})

Given('I set the request max retries as {string}', async function (this: CustomWorld, max: string) {
  max = expandVariables(this, max);
  const maxRetries: number = parseInt(max);
  requestContext.setRequestMaxRetries(this, maxRetries);
})

Given('I set the request timeout as {string}', async function (this: CustomWorld, timeO: string) {
  timeO = expandVariables(this, timeO);
  const timeout: number = parseInt(timeO);
  requestContext.setRequestTimeout(this, timeout);
})

Given('I set the request method as {string}', async function (this: CustomWorld, method: string) {
  method = expandVariables(this, method);
  requestContext.setRequestMethod(this, method);
})

/********Variations to set Request Body steps (simple string, from file, as follow table)*******/
Given('I set the request data as string {string}', async function (this: CustomWorld, body: string) {
  body = expandVariables(this, body);
  requestContext.setRequestData(this, body);
})

Given('I set the request data from file {string}', async function (this: CustomWorld, file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    requestContext.setRequestData(this, expandVariables(this, fileContent));
  }
})

Given('I set the request data as follow to {string} format', async function (this: CustomWorld, table: DataTable, format: string) {
  const requestBody: Record<string, string>[] = table.hashes();
  const requestDataTransformed: Record<string, any>[] = hashTableTransformed(this, requestBody);

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
  requestContext.setRequestData(this, requestDataStringFormatted);
})

When('I amend the request data where key {string} to be {string}', async function (this: CustomWorld, keyToAmend: string, valueToAmend: string) {
  keyToAmend = expandVariables(this, keyToAmend);
  valueToAmend = expandVariables(this, valueToAmend);
  const originalRequestData = requestContext.getRequestData(this,);
  if (isJsonString(originalRequestData) && originalRequestData != null && originalRequestData != undefined) {
    const amendedJson: string = JSON.stringify(inferAndCastAndAssignJson(originalRequestData, keyToAmend, valueToAmend));
    requestContext.setRequestData(this, amendedJson);
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

Given('I set the response content type as {string}', async function (this: CustomWorld, contentType: string) {
  contentType = expandVariables(this, contentType);
  responseContext.setResponseContentType(this, contentType);
})

Given('I set the response content type as {string}', async function (this: CustomWorld, contentType: string) {
  contentType = expandVariables(this, contentType);
  responseContext.setResponseContentType(this, contentType);
})

Given('I set the response headers as follow', async function (this: CustomWorld, table: DataTable) {
  const responseHeaders = table.rowsHash();
  const responseHeadersTransformed = rowTableTransformed(this, responseHeaders);
  responseContext.setResponseHeaders(this, responseHeaders);
})

Given('I set the response path content as {string}', async function (this: CustomWorld, path: string) {
  path = expandVariables(this, path);
  responseContext.setResponsePath(this, path);
})

Given('I set the response status content as {string}', async function (this: CustomWorld, statusInString: string) {
  statusInString = expandVariables(this, statusInString);
  try {
    const status: number = parseInt(statusInString);
    responseContext.setResponseStatus(this, status);
  } catch (error) {
    console.log('Failed tp set Response status: ', error);
  }
})

Given('I set the response status message content as {string}', async function (this: CustomWorld, message: string) {
  message = expandVariables(this, message);
  responseContext.setResponseStatusMessage(this, message);
})

Given('I set the response delay seconds as {string}', async function (this: CustomWorld, seconds: string) {
  seconds = expandVariables(this, seconds);
  try {
    const secondsInt: number = parseInt(seconds);
    responseContext.setResponseDelayMilliseconds(this, secondsInt * 1000);
  } catch (error) {
    console.log('Failed tp set Response Delay Seconds: ', error);
  }
})


/********Variations to set Response Body and JSON steps (simple string, from file, as follow table)*******/
Given('I set the response body as string {string}', async function (this: CustomWorld, body: string) {
  body = expandVariables(this, body);
  responseContext.setResponseBody(this, body);
})

Given('I set the response data as string {string}', async function (this: CustomWorld, data: string) {
  data = expandVariables(this, data);
  responseContext.setResponseData(this, data);
})

Given('I set the response body from file {string}', async function (this: CustomWorld, file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseBody(this, expandVariables(this, fileContent));
  }
})

Given('I set the response data from file {string}', async function (this: CustomWorld, file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseData(this, expandVariables(this, fileContent));
  }
})

Given('I set the response body as follow to {string}', async function (this: CustomWorld, table: DataTable, format: string) {
  const responseBody: Record<string, string>[] = table.hashes();
  const responseBodyTransformed: Record<string, any>[] = hashTableTransformed(this, responseBody);

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
  responseContext.setResponseBody(this, responseBodyStringFormatted);
})

Given('I set the response data as follow to {string}', async function (this: CustomWorld, table: DataTable, format: string) {
  const responseData: Record<string, string>[] = table.hashes();
  const responseDataTransformed: Record<string, string>[] = hashTableTransformed(this, responseData);

  let responseDataStringFormatted: string = "";
  if (format in ["json", "JSON", "Json"]) {
    responseDataStringFormatted = responseDataTransformed.length === 1 ? JSON.stringify(responseDataTransformed[0]) : JSON.stringify(responseDataTransformed);
  } else if (format in ["xml", "XML", "Xml"]) {
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false
    });
    responseDataStringFormatted = responseDataTransformed.length === 1 ? builder.build(responseDataTransformed[0]) : builder.build(responseDataTransformed);
  }
  responseContext.setResponseData(this, responseDataStringFormatted);
})

When('I amend the response data where key {string} to be {string}', async function (this: CustomWorld, keyToAmend: string, valueToAmend: string) {
  keyToAmend = expandVariables(this, keyToAmend);
  valueToAmend = expandVariables(this, valueToAmend);
  const originalResponse = responseContext.getResponseData(this,);
  //json amend
  if (isJsonString(originalResponse) && originalResponse != null && originalResponse != undefined) {
    const amendedRespJson: string = JSON.stringify(inferAndCastAndAssignJson(originalResponse, keyToAmend, valueToAmend));
    responseContext.setResponseData(this, amendedRespJson);
  }
  //xml amend
  if (isXmlString(originalResponse) && originalResponse != null && originalResponse != undefined) {
    const amendedRespXml: string = inferAndCastAndAssignXml(originalResponse, keyToAmend, valueToAmend);
    responseContext.setResponseData(this, amendedRespXml);
  }
})

/***************API Actions GET, POST, PUT, DELETE */
When('I send GET request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders(this,) || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams(this,) || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm(this,) || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode(this,) || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors(this,) || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects(this,) || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries(this,) || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout(this,) || undefined;
  const response: APIResponse = await this.request.get(expandVariables(this, url), {
    headers: headers,
    params: params,
    form: form,
    failOnStatusCode: failOnStatusCode,
    ignoreHTTPSErrors: ignoreHTTPSErrors,
    maxRedirects: maxRedirects,
    maxRetries: maxRetries,
    timeout: timeout
  });
  // expect(response.status()).to.equal(200);
  assert.strictEqual(response.status(), 200);
  this.response = response;

  let respData: Promise<Serializable>;
  try {
    respData = await response.json() || undefined;
    if (respData != undefined && (isJsonString((await respData).toString()) || isXmlString((await respData).toString()))) {
      responseContext.setResponseData(this, (await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(this, body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(this, body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})

When('I send POST request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders(this,) || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams(this,) || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm(this,) || undefined;
  const data: string | number | bigint | true | object | undefined = requestContext.getRequestData(this,) || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode(this,) || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors(this,) || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects(this,) || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries(this,) || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout(this,) || undefined;
  const response: APIResponse = await this.request.post(expandVariables(this, url), {
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
  // expect(response.status()).to.equal(200);
  assert.ok(response.status() >= 200 && response.status() < 300);
  this.response = response;

  let respData: Promise<Serializable>;
  try {
    respData = await response.json() || undefined;
    if (respData != undefined && (isJsonString((await respData).toString()) || isXmlString((await respData).toString()))) {
      responseContext.setResponseData(this, (await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(this, body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(this, body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})

When('I send PUT request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders(this,) || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams(this,) || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm(this,) || undefined;
  const data: string | number | bigint | true | object | undefined = requestContext.getRequestData(this,) || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode(this,) || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors(this,) || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects(this,) || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries(this,) || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout(this,) || undefined;
  const response: APIResponse = await this.request.put(expandVariables(this, url), {
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
  // expect(response.status()).to.equal(200);
  assert.ok(response.status() >= 200 && response.status() < 300);
  this.response = response;

  let respData: Promise<Serializable>;
  try {
    respData = await response.json() || undefined;
    if (respData != undefined && (isJsonString((await respData).toString()) || isXmlString((await respData).toString()))) {
      responseContext.setResponseData(this, (await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(this, body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(this, body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})

When('I send DELETE request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders(this,) || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams(this,) || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm(this,) || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode(this,) || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors(this,) || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects(this,) || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries(this,) || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout(this,) || undefined;
  const response: APIResponse = await this.request.delete(expandVariables(this, url), {
    headers: headers,
    params: params,
    form: form,
    failOnStatusCode: failOnStatusCode,
    ignoreHTTPSErrors: ignoreHTTPSErrors,
    maxRedirects: maxRedirects,
    maxRetries: maxRetries,
    timeout: timeout
  });
  // expect(response.status()).to.equal(200);
  assert.strictEqual(response.status(), 200);
  this.response = response;

  let respData: Promise<Serializable>;
  try {
    respData = await response.json() || undefined;
    if (respData != undefined && (isJsonString((await respData).toString()) || isXmlString((await respData).toString()))) {
      responseContext.setResponseData(this, (await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(this, body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(this, body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})
