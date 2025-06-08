import { DataTable, Given, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
// import { expect } from "chai";
import { APIResponse } from "@playwright/test";
import { Serializable } from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import { inferAndCastAndAssignJson, inferAndCastAndAssignXml, isJsonString, isXmlString } from "../support/utilities";
import { XMLBuilder } from "fast-xml-parser";
import { hashTableTransformed, rowTableTransformed } from "../support/tables";
import assert from "assert";
import { expandVariablesDeepAsString } from "../support/variables";

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
  const requestHeadersTransformed: Record<string, any> = rowTableTransformed(requestHeaders)
  requestContext.setRequestHeaders(requestHeadersTransformed);
})

Given('I set the request params as follow', async function (table: DataTable) {
  const requestParams = table.rowsHash();
  const requestParamsTransformed: Record<string, any> = rowTableTransformed(requestParams);
  requestContext.setRequestParams(requestParamsTransformed);
})

Given('I set the request form as follow', async function (table: DataTable) {
  const requestForm = table.rowsHash();
  const requestFormTransformed: Record<string, string | number | boolean> = rowTableTransformed(requestForm);
  requestContext.setRequestForm(requestFormTransformed);
})

Given('I set the request if fail-on statuscode {string}', async function (flag: string) {
  flag = expandVariablesDeepAsString(flag);
  const failOnStatusCode: boolean = (flag == "true" || flag == "True" || flag == "TRUE");
  requestContext.setRequestFailOnStatusCode(failOnStatusCode);
})

Given('I set the request if ignore Https errors {string}', async function (flag: string) {
  flag = expandVariablesDeepAsString(flag);
  const ignoreHTTPSErrors: boolean = (flag == "true" || flag == "True" || flag == "TRUE");
  requestContext.setRequestIgnoreHTTPSErrors(ignoreHTTPSErrors);
})

Given('I set the request max redirects as {string}', async function (max: string) {
  max = expandVariablesDeepAsString(max);
  const maxRedirects: number = parseInt(max);
  requestContext.setRequestMaxRedirects(maxRedirects);
})

Given('I set the request max retries as {string}', async function (max: string) {
  max = expandVariablesDeepAsString(max);
  const maxRetries: number = parseInt(max);
  requestContext.setRequestMaxRetries(maxRetries);
})

Given('I set the request timeout as {string}', async function (timeO: string) {
  timeO = expandVariablesDeepAsString(timeO);
  const timeout: number = parseInt(timeO);
  requestContext.setRequestTimeout(timeout);
})

Given('I set the request method as {string}', async function (method: string) {
  method = expandVariablesDeepAsString(method);
  requestContext.setRequestMethod(method);
})

/********Variations to set Request Body steps (simple string, from file, as follow table)*******/
Given('I set the request data as string {string}', async function (body: string) {
  body = expandVariablesDeepAsString(body);
  requestContext.setRequestData(body);
})

Given('I set the request data from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    requestContext.setRequestData(expandVariablesDeepAsString(fileContent));
  }
})

Given('I set the request data as follow to {string} format', async function (table: DataTable, format: string) {
  const requestBody: Record<string, string>[] = table.hashes();
  const requestDataTransformed: Record<string, any>[] = hashTableTransformed(requestBody);

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
  keyToAmend = expandVariablesDeepAsString(keyToAmend);
  valueToAmend = expandVariablesDeepAsString(valueToAmend);
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
  contentType = expandVariablesDeepAsString(contentType);
  responseContext.setResponseContentType(contentType);
})

Given('I set the response content type as {string}', async function (contentType: string) {
  contentType = expandVariablesDeepAsString(contentType);
  responseContext.setResponseContentType(contentType);
})

Given('I set the response headers as follow', async function (table: DataTable) {
  const responseHeaders = table.rowsHash();
  const responseHeadersTransformed = rowTableTransformed(responseHeaders);
  responseContext.setResponseHeaders(responseHeaders);
})

Given('I set the response path content as {string}', async function (path: string) {
  path = expandVariablesDeepAsString(path);
  responseContext.setResponsePath(path);
})

Given('I set the response status content as {string}', async function (statusInString: string) {
  statusInString = expandVariablesDeepAsString(statusInString);
  try {
    const status: number = parseInt(statusInString);
    responseContext.setResponseStatus(status);
  } catch (error) {
    console.log('Failed tp set Response status: ', error);
  }
})

/********Variations to set Response Body and JSON steps (simple string, from file, as follow table)*******/
Given('I set the response body as string {string}', async function (body: string) {
  body = expandVariablesDeepAsString(body);
  responseContext.setResponseBody(body);
})

Given('I set the response data as string {string}', async function (data: string) {
  data = expandVariablesDeepAsString(data);
  responseContext.setResponseData(data);
})

Given('I set the response body from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseBody(expandVariablesDeepAsString(fileContent));
  }
})

Given('I set the response data from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseData(expandVariablesDeepAsString(fileContent));
  }
})

Given('I set the response body as follow to {string}', async function (table: DataTable, format: string) {
  const responseBody: Record<string, string>[] = table.hashes();
  const responseBodyTransformed: Record<string, any>[] = hashTableTransformed(responseBody);

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

Given('I set the response data as follow to {string}', async function (table: DataTable, format: string) {
  const responseData: Record<string, string>[] = table.hashes();
  const responseDataTransformed: Record<string, string>[] = hashTableTransformed(responseData);

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
  responseContext.setResponseData(responseDataStringFormatted);
})

When('I amend the response data where key {string} to be {string}', async function (keyToAmend: string, valueToAmend: string) {
  keyToAmend = expandVariablesDeepAsString(keyToAmend);
  valueToAmend = expandVariablesDeepAsString(valueToAmend);
  const originalResponse = responseContext.getResponseData();
  //json amend
  if (isJsonString(originalResponse) && originalResponse != null && originalResponse != undefined) {
    const amendedRespJson: string = JSON.stringify(inferAndCastAndAssignJson(originalResponse, keyToAmend, valueToAmend));
    responseContext.setResponseData(amendedRespJson);
  }
  //xml amend
  if (isXmlString(originalResponse) && originalResponse != null && originalResponse != undefined) {
    const amendedRespXml: string = inferAndCastAndAssignXml(originalResponse, keyToAmend, valueToAmend);
    responseContext.setResponseData(amendedRespXml);
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
  const response: APIResponse = await this.request.get(expandVariablesDeepAsString(url), {
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
      responseContext.setResponseData((await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
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
  const response: APIResponse = await this.request.post(expandVariablesDeepAsString(url), {
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
      responseContext.setResponseData((await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})

When('I send PUT request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams() || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm() || undefined;
  const data: string | number | bigint | true | object | undefined = requestContext.getRequestData() || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode() || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors() || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects() || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries() || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout() || undefined;
  const response: APIResponse = await this.request.put(expandVariablesDeepAsString(url), {
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
      responseContext.setResponseData((await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})

When('I send DELETE request to url {string}', async function (this: CustomWorld, url: string) {
  const headers: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const params: { [key: string]: string | number | boolean } = requestContext.getRequestParams() || undefined;
  const form: { [key: string]: string | number | boolean } = requestContext.getRequestForm() || undefined;
  const failOnStatusCode: boolean | undefined = requestContext.getRequestFailOnStatusCode() || undefined;
  const ignoreHTTPSErrors: boolean | undefined = requestContext.getRequestIgnoreHTTPSErrors() || undefined;
  const maxRedirects: number | undefined = requestContext.getRequestMaxRedirects() || undefined;
  const maxRetries: number | undefined = requestContext.getRequestMaxRetries() || undefined;
  const timeout: number | undefined = requestContext.getRequestTimeout() || undefined;
  const response: APIResponse = await this.request.delete(expandVariablesDeepAsString(url), {
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
      responseContext.setResponseData((await respData).toString());
    }
  } catch (error) {
  }
  const body: Buffer<ArrayBufferLike> = await response.body();
  responseContext.setResponseBody(body.toString());

  try {
    if (body != undefined && (isJsonString(body.toString()) || isXmlString(body.toString()))) {
      responseContext.setResponseData(body.toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.error("Serialization Exception: ", error);
  }
})
