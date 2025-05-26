import { APIRequestContext, APIResponse, Browser, BrowserContext, Page } from "@playwright/test";
import { Difference, flattenObject, isJsonString, JSONObjectFieldTakeContextCallbackFunc } from './utilities';
import { Serializable } from "child_process";

let browser: Browser;
let browserContext: BrowserContext;
let page: Page;
let request: APIRequestContext;
let requestHeaders: Record<string, string>;
let requestParams: Record<string, string | number | boolean>;
let requestForm: Record<string, string | number | boolean>;
let requestMethod: string;
let requestData: string;
let requestFailOnStatusCode: boolean;
let requestIgnoreHTTPSErrors: boolean;
let requestMaxRedirects: number;
let requestMaxRetries: number;
let requestTimeout: number;
let responseJson: string;
let responseBody: string | Buffer;
let responseContentType: string;
let responseHeaders: Record<string, string>;
let responsePath: string;
let responseStatus: number;
let expectedJSon: string;
let actualJson: string;
let tolerantKeys: string[];
let jsonDifferences: Difference[];


export const globalContext: Record<string, any> = {};
export const setGlobalContext: <T>(key: string, value: T) => void = <T>(key: string, value: T) => { globalContext[key] = value; };
export const getGlobalContext: <T>(key: string) => T = <T>(key: string): T => { return globalContext[key] as T; };

// export function refreshAllContextVariables(this: any) {

// };

export const playwrightContext = {
  getBrowser: () => browser,
  setBrowser: (b: Browser) => (browser = b),

  getBrowserContext: () => browserContext,
  setBrowserContext: (bC: BrowserContext) => (browserContext = bC),

  getPage: () => page,
  setPage: (p: Page) => (page = p),

  getRequest: () => request,
  setRequest: (req: APIRequestContext) => request = req
};

export const requestContext = {
  getRequestHeaders: () => requestHeaders,
  setRequestHeaders: (reqH: Record<string, string>) => {
    requestHeaders = reqH;
    Object.entries(reqH).forEach(([key, value]) => { setGlobalContext(`RequestHeaders_${key}`, value); });
  },
  getRequestParams: () => requestParams,
  setRequestParams: (reqP: Record<string, string | number | boolean>) => {
    requestParams = reqP;
    Object.entries(reqP).forEach(([key, value]) => { setGlobalContext(`RequestParams_${key}`, value); });
  },
  getRequestForm: () => requestForm,
  setRequestForm: (reqF: Record<string, string | number | boolean>) => {
    requestForm = reqF;
    Object.entries(reqF).forEach(([key, value]) => { setGlobalContext(`RequestForm_${key}`, value); });
  },
  getRequestMethod: () => requestMethod,
  setRequestMethod: (reqM: string) => {
    requestMethod = reqM;
    setGlobalContext('RequestMethod', reqM);
  },
  getRequestData: () => requestData,
  setRequestData: (reqB: string) => {
    requestData = reqB;
    isJsonString(reqB.toString()) ? JSONObjectFieldTakeContextCallbackFunc(JSON.parse(reqB), 'RequestData_', setGlobalContext) : setGlobalContext('RequestData', reqB.toString());
  },
  getRequestFailOnStatusCode: () => requestFailOnStatusCode,
  setRequestFailOnStatusCode: (reqFailOnStatusCode: boolean) => {
    requestFailOnStatusCode = reqFailOnStatusCode;
    setGlobalContext('RequestFailOnStatusCode', reqFailOnStatusCode);
  },
  getRequestIgnoreHTTPSErrors: () => requestIgnoreHTTPSErrors,
  setRequestIgnoreHTTPSErrors: (reqIgnoreHTTPSErrors: boolean) => {
    requestIgnoreHTTPSErrors = reqIgnoreHTTPSErrors;
    setGlobalContext('RequestIgnoreHTTPSErrors', reqIgnoreHTTPSErrors);
  },
  getRequestMaxRedirects: () => requestMaxRedirects,
  setRequestMaxRedirects: (reqMaxRedirects: number) => {
    requestMaxRedirects = reqMaxRedirects;
    setGlobalContext('RequestMaxRedirects', reqMaxRedirects);
  },
  getRequestMaxRetries: () => requestMaxRetries,
  setRequestMaxRetries: (reqMaxRetries: number) => {
    requestMaxRetries = reqMaxRetries;
    setGlobalContext('RequestMaxRetries', reqMaxRetries);
  },
  getRequestTimeout: () => requestTimeout,
  setRequestTimeout: (reqTimeout: number) => {
    requestTimeout = reqTimeout;
    setGlobalContext('RequestTimeout', reqTimeout);
  },
}

export const responseContext = {
  getResponseJson: () => responseJson,
  setResponseJson: (respJson: string) => {
    responseJson = respJson;
    // for(const [key, value] of Object.entries(flattenObject(respJson))) {
    //   setGlobalContext(`ResponseJson_${key}`, value);
    // }
    isJsonString(respJson.toString()) ? JSONObjectFieldTakeContextCallbackFunc(JSON.parse(respJson), 'ResponseJson_', setGlobalContext) : setGlobalContext('ResponseJson', respJson.toString());
  },
  getResponseBody: () => responseBody,
  setResponseBody: (respBody: string | Buffer) => {
    responseBody = respBody;
    setGlobalContext("ResponseBody", respBody);
  },
  getResponseContentType: () => responseContentType,
  setResponseContentType: (respContentType: string) => {
    responseContentType = respContentType;
    setGlobalContext("ResponseContentType", respContentType);
  },
  getResponseHeaders: () => responseHeaders,
  setResponseHeaders: (respHeaders: Record<string, string>) => {
    responseHeaders = respHeaders;
    Object.entries(respHeaders).forEach(([key, value]) => { setGlobalContext(`ResponseHeaders_${key}`, value); });
  },
  getResponsePath: () => responsePath,
  setResponsePath: (respPath: string) => {
    responsePath = respPath;
    setGlobalContext("ResponsePath", respPath);
  },
  getResponseStatus: () => responseStatus,
  setResponseStatus: (respStatus: number) => {
    responseStatus = respStatus;
    setGlobalContext("ResponseStatus", respStatus);
  },
}

export const jsonContext = {
  getExpectedJson: () => expectedJSon,
  setExpectedJson: (expJ: string) => {
    expectedJSon = expJ;
    setGlobalContext('ExpectedJson', expJ);
  },
  getActualJson: () => actualJson,
  setActualJson: (actJ: string) => {
    actualJson = actJ;
    setGlobalContext('ActualJson', actJ);
  },
  getTolerantKeys: () => tolerantKeys,
  setTolerantKeys: (tolKeys: string[]) => {
    tolerantKeys = tolKeys;
    tolKeys.forEach(key => setGlobalContext(`TolerantKeys_${key}`, key));
  },
  getJsonDifferences: () => jsonDifferences,
  setJsonDifferences: (jsonD: Difference[]) => {
    jsonDifferences = jsonD;
  }
}
