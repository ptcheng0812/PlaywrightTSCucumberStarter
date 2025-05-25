import { DataTable, Given, When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
import { expect } from "chai";
import { APIResponse } from "@playwright/test";
import { Serializable } from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import { isJsonString } from "../helper/utilities";

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

Given('I set the request data as follow', async function (table: DataTable) {
  const requestBody = table.hashes();
  const requestBodyTransformed: Record<string, string>[] = requestBody.map((b) => {
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
  const requestBodyJSONString: string = requestBodyTransformed.length === 1 ? JSON.stringify(requestBodyTransformed[0]) : JSON.stringify(requestBodyTransformed)
  requestContext.setRequestData(requestBodyJSONString);
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
Given('I set the response body as {string}', async function (body: string) {
  responseContext.setResponseBody(body);
})

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

/********Variations to set Response Body steps (simple string, from file, as follow table)*******/
Given('I set the response json as string {string}', async function (json: string) {
  responseContext.setResponseJson(json);
})

Given('I set the response json from file {string}', async function (file: string) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    responseContext.setResponseJson(fileContent);
  }
})

Given('I set the response json as follow', async function (table: DataTable) {
  const responseBody: Record<string, string>[] = table.hashes();
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
  const responseBodyJSONString: string = responseBodyTransformed.length === 1 ? JSON.stringify(responseBodyTransformed[0]) : JSON.stringify(responseBodyTransformed)
  responseContext.setResponseJson(responseBodyJSONString);
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

  try {
    const data: Promise<Serializable> = await response.json() || undefined;
    if (data != undefined && typeof data == 'object') {
      responseContext.setResponseJson((await data).toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.log("Serialization Exception: ", error);
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

  try {
    const respData: Promise<Serializable> = await response.json() || undefined;
    if (respData != undefined && typeof respData == 'object') {
      responseContext.setResponseJson((await respData).toString());
    } else {
      console.log("WARNING: No response data returned and stored in context")
    }
  } catch (error) {
    console.log("Serialization Exception: ", error);
  }
})
