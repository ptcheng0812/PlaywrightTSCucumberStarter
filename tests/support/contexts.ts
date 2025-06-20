import { APIRequestContext, APIResponse, Browser, BrowserContext, Page } from "@playwright/test";
import { Difference, flattenObject, isJsonString, isXmlString, ObjectFieldTakeContextCallbackFunc, xmlParser } from './utilities';
import { Serializable } from "child_process";
import { XMLParser } from "fast-xml-parser";

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
let responseData: string;
let responseBody: string | Buffer;
let responseContentType: string;
let responseHeaders: Record<string, string>;
let responsePath: string;
let responseStatus: number;
let expectedJson: string;
let actualJson: string;
let tolerantKeys: string[];
let jsonDifferences: Difference[];
let expectedXml: string;
let actualXml: string;
let xmlDifferences: Difference[];



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
    if (isJsonString(reqB.toString())) {
      ObjectFieldTakeContextCallbackFunc(JSON.parse(reqB), 'RequestData', setGlobalContext);
      setGlobalContext('RequestData', reqB.toString());
    } else if (isXmlString(reqB.toString())) {
      ObjectFieldTakeContextCallbackFunc(xmlParser(reqB), 'RequestData', setGlobalContext);
      setGlobalContext('RequestData', reqB.toString());
    }
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
  getResponseData: () => responseData,
  setResponseData: (respJson: string) => {
    responseData = respJson;
    if (isJsonString(respJson.toString())) {
      ObjectFieldTakeContextCallbackFunc(JSON.parse(respJson), 'ResponseData', setGlobalContext);
      setGlobalContext('ResponseData', respJson.toString());
    } else if (isXmlString(respJson.toString())) {
      ObjectFieldTakeContextCallbackFunc(xmlParser(respJson), 'ResponseData', setGlobalContext);
      setGlobalContext('ResponseData', respJson.toString());
    }
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
  getExpectedJson: () => expectedJson,
  setExpectedJson: (expJ: string) => {
    expectedJson = expJ;
    if (isJsonString(expJ)) {
      ObjectFieldTakeContextCallbackFunc(JSON.parse(expJ), 'ExpectedJson', setGlobalContext);
      setGlobalContext('ExpectedJson', expJ);
    } else {
      setGlobalContext('ExpectedJson', expJ);
    }
  },
  getActualJson: () => actualJson,
  setActualJson: (actJ: string) => {
    actualJson = actJ;
    if (isJsonString(actJ)) {
      ObjectFieldTakeContextCallbackFunc(JSON.parse(actJ), 'ActualJson', setGlobalContext);
      setGlobalContext('ActualJson', actJ);
    } else {
      setGlobalContext('ActualJson', actJ);
    }
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

export const xmlContext = {
  getExpectedXml: () => expectedXml,
  setExpectedXml: (expXml: string) => {
    expectedXml = expXml;
    const parser = new XMLParser({
      ignoreAttributes: false, // allow comparison of attributes
      attributeNamePrefix: '@_' // makes attributes easier to identify
    });
    try {
      ObjectFieldTakeContextCallbackFunc(parser.parse(expXml), 'ExpectedXml', setGlobalContext)
    } catch {
      console.error(`Error: Fail to set global contexts for xml fields`)
    }
    setGlobalContext('ExpectedXml', expXml);
  },
  getActualXml: () => actualXml,
  setActualXml: (actXml: string) => {
    actualXml = actXml;
    const parser = new XMLParser({
      ignoreAttributes: false, // allow comparison of attributes
      attributeNamePrefix: '@_' // makes attributes easier to identify
    });
    try {
      ObjectFieldTakeContextCallbackFunc(parser.parse(actXml), 'ActualXml', setGlobalContext)
    } catch {
      console.error(`Error: Fail to set global contexts for xml fields`)
    }
    setGlobalContext('ActualXml', actXml);
  },
  getTolerantKeys: () => tolerantKeys,
  setTolerantKeys: (tolKeys: string[]) => {
    tolerantKeys = tolKeys;
    tolKeys.forEach(key => setGlobalContext(`TolerantKeys_${key}`, key));
  },
  getXmlDifferences: () => xmlDifferences,
  setXmlDifferences: (xmlD: Difference[]) => {
    xmlDifferences = xmlD;
  }
}
