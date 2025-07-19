import { APIRequestContext, APIResponse, Browser, BrowserContext, Page } from "@playwright/test";
import { Serializable } from "child_process";
import { XMLParser } from "fast-xml-parser";
import { DatabaseConnection } from "./database";
import { WireMockRestClient } from "wiremock-rest-client";
import { Difference, isJsonString, isXmlString, ObjectFieldTakeContextCallbackFunc, xmlParser } from "./commonUtils";
import { CustomWorld } from './world';

let browser: Browser;
let browserContext: BrowserContext;
let page: Page;
let request: APIRequestContext;
// let requestHeaders: Record<string, string>;
// let requestParams: Record<string, string | number | boolean>;
// let requestForm: Record<string, string | number | boolean>;
// let requestMethod: string;
// let requestData: string;
// let requestFailOnStatusCode: boolean;
// let requestIgnoreHTTPSErrors: boolean;
// let requestMaxRedirects: number;
// let requestMaxRetries: number;
// let requestTimeout: number;
// let responseData: string;
// let responseBody: string | Buffer;
// let responseContentType: string;
// let responseHeaders: Record<string, string>;
// let responsePath: string;
// let responseStatus: number;
// let expectedJson: string;
// let actualJson: string;
// let tolerantKeys: string[];
// let jsonDifferences: Difference[];
// let expectedXml: string;
// let actualXml: string;
// let xmlDifferences: Difference[];



export const globalContext: Record<string, any> = {};
export const setGlobalContext: <T>(world: CustomWorld, key: string, value: T) => void = <T>(world: CustomWorld, key: string, value: T) => { world.setW<T>(key, value) };
export const getGlobalContext: <T>(world: CustomWorld, key: string) => T = <T>(world: CustomWorld, key: string): T => { return world.getW<T>(key) };

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

export const mockServerContext = {
  getBaseUrl: (world: CustomWorld): string => getGlobalContext(world, "mockServerBaseUrl"),
  setBaseUrl: (world: CustomWorld, baseUrl: string) => setGlobalContext(world, "mockServerBaseUrl", baseUrl),
  getWireMockClient: (world: CustomWorld): WireMockRestClient => getGlobalContext(world, "WireMockRestClient"),
  setWireMockClient: (world: CustomWorld, client: WireMockRestClient) => setGlobalContext(world, "WireMockRestClient", client),
}

export const requestContext = {
  getRequestHeaders: (world: CustomWorld): Record<string, string> => getGlobalContext(world, "RequestHeaders"),
  setRequestHeaders: (world: CustomWorld, reqH: Record<string, string>) => {
    // requestHeaders = reqH;
    setGlobalContext(world, "RequestHeaders", reqH);
    Object.entries(reqH).forEach(([key, value]) => { setGlobalContext(world, `RequestHeaders_${key}`, value); });
  },
  getRequestParams: (world: CustomWorld): Record<string, string | number | boolean> => getGlobalContext(world, "RequestParams"),
  setRequestParams: (world: CustomWorld, reqP: Record<string, string | number | boolean>) => {
    setGlobalContext(world, "RequestParams", reqP);
    Object.entries(reqP).forEach(([key, value]) => { setGlobalContext(world, `RequestParams_${key}`, value); });
  },
  getRequestForm: (world: CustomWorld): Record<string, string | number | boolean> => getGlobalContext(world, "RequestForm"),
  setRequestForm: (world: CustomWorld, reqF: Record<string, string | number | boolean>) => {
    setGlobalContext(world, "RequestForm", reqF);
    Object.entries(reqF).forEach(([key, value]) => { setGlobalContext(world, `RequestForm_${key}`, value); });
  },
  getRequestMethod: (world: CustomWorld): string => getGlobalContext(world, "RequestMethod"),
  setRequestMethod: (world: CustomWorld, reqM: string) => {
    setGlobalContext(world, 'RequestMethod', reqM);
  },
  getRequestData: (world: CustomWorld): string => getGlobalContext(world, "RequestData"),
  setRequestData: (world: CustomWorld, reqB: string) => {
    if (isJsonString(reqB.toString())) {
      ObjectFieldTakeContextCallbackFunc(world, JSON.parse(reqB), 'RequestData', setGlobalContext);
      setGlobalContext(world, 'RequestData', reqB.toString());
    } else if (isXmlString(reqB.toString())) {
      ObjectFieldTakeContextCallbackFunc(world, xmlParser(reqB), 'RequestData', setGlobalContext);
      setGlobalContext(world, 'RequestData', reqB.toString());
    }
  },
  getRequestFailOnStatusCode: (world: CustomWorld): boolean => getGlobalContext(world, "RequestFailOnStatusCode"),
  setRequestFailOnStatusCode: (world: CustomWorld, reqFailOnStatusCode: boolean) => {
    setGlobalContext(world, 'RequestFailOnStatusCode', reqFailOnStatusCode);
  },
  getRequestIgnoreHTTPSErrors: (world: CustomWorld): boolean => getGlobalContext(world, "RequestIgnoreHTTPSErrors"),
  setRequestIgnoreHTTPSErrors: (world: CustomWorld, reqIgnoreHTTPSErrors: boolean) => {
    setGlobalContext(world, 'RequestIgnoreHTTPSErrors', reqIgnoreHTTPSErrors);
  },
  getRequestMaxRedirects: (world: CustomWorld): number => getGlobalContext(world, "RequestMaxRedirects"),
  setRequestMaxRedirects: (world: CustomWorld, reqMaxRedirects: number) => {
    setGlobalContext(world, 'RequestMaxRedirects', reqMaxRedirects);
  },
  getRequestMaxRetries: (world: CustomWorld): number => getGlobalContext(world, "RequestMaxRetries"),
  setRequestMaxRetries: (world: CustomWorld, reqMaxRetries: number) => {
    setGlobalContext(world, 'RequestMaxRetries', reqMaxRetries);
  },
  getRequestTimeout: (world: CustomWorld): number => getGlobalContext(world, "RequestTimeout"),
  setRequestTimeout: (world: CustomWorld, reqTimeout: number) => {
    setGlobalContext(world, 'RequestTimeout', reqTimeout);
  },
  getRequestCookies: (world: CustomWorld): Record<string, any> => getGlobalContext(world, "RequestCookies"),
  setRequestCookies: (world: CustomWorld, cookies: Record<string, any>) => {
    setGlobalContext(world, "RequestCookies", cookies);
    Object.entries(cookies).forEach(([k, v]) => { setGlobalContext(world, `RequestCookies_${k}`, v); });
  },
  getBasicHttpAuthCredentials: (world: CustomWorld): { [k: string]: any; password: string; username: string; } => getGlobalContext(world, "BasicHttpAuthCredentials"),
  setBasicHttpAuthCredentials: (world: CustomWorld, credentials: { [k: string]: any; password: string; username: string; }) => {
    setGlobalContext(world, "BasicHttpAuthCredentials", credentials);
    Object.entries(credentials).forEach(([k, v]) => { setGlobalContext(world, `BasicHttpAuthCredentials_${k}`, v) });
  }
}

export const responseContext = {
  getResponseData: (world: CustomWorld): string => getGlobalContext(world, "ResponseData"),
  setResponseData: (world: CustomWorld, respJson: string) => {
    if (isJsonString(respJson.toString())) {
      setGlobalContext(world, 'ResponseData', respJson.toString());
      ObjectFieldTakeContextCallbackFunc(world, JSON.parse(respJson), 'ResponseData', setGlobalContext);
    } else if (isXmlString(respJson.toString())) {
      setGlobalContext(world, 'ResponseData', respJson.toString());
      ObjectFieldTakeContextCallbackFunc(world, xmlParser(respJson), 'ResponseData', setGlobalContext);
    }
  },
  getResponseBody: (world: CustomWorld): string | Buffer => getGlobalContext(world, "ResponseBody"),
  setResponseBody: (world: CustomWorld, respBody: string | Buffer) => {
    setGlobalContext(world, "ResponseBody", respBody);
  },
  getResponseContentType: (world: CustomWorld): string => getGlobalContext(world, "ResponseContentType"),
  setResponseContentType: (world: CustomWorld, respContentType: string) => {
    setGlobalContext(world, "ResponseContentType", respContentType);
  },
  getResponseHeaders: (world: CustomWorld): Record<string, string> => getGlobalContext(world, "ResponseHeaders"),
  setResponseHeaders: (world: CustomWorld, respHeaders: Record<string, string>) => {
    setGlobalContext(world, "ResponseHeaders", respHeaders);
    Object.entries(respHeaders).forEach(([key, value]) => { setGlobalContext(world, `ResponseHeaders_${key}`, value); });
  },
  getResponsePath: (world: CustomWorld): string => getGlobalContext(world, "ResponsePath"),
  setResponsePath: (world: CustomWorld, respPath: string) => {
    setGlobalContext(world, "ResponsePath", respPath);
  },
  getResponseStatus: (world: CustomWorld): number => getGlobalContext(world, "ResponseStatus"),
  setResponseStatus: (world: CustomWorld, respStatus: number) => {
    setGlobalContext(world, "ResponseStatus", respStatus);
  },
  getResponseStatusMessage: (world: CustomWorld): string => getGlobalContext(world, "ResponseStatusMessage"),
  setResponseStatusMessage: (world: CustomWorld, respStatusM: string) => {
    setGlobalContext(world, "ResponseStatusMessage", respStatusM);
  },
  getResponseDelayMilliseconds: (world: CustomWorld): number => getGlobalContext(world, "ResponseDelayMilliseconds"),
  setResponseDelayMilliseconds: (world: CustomWorld, respDelayMilliseconds: number) => {
    setGlobalContext(world, "ResponseDelayMilliseconds", respDelayMilliseconds);
  },
}

export const jsonContext = {
  getExpectedJson: (world: CustomWorld): string => getGlobalContext(world, "ExpectedJson"),
  setExpectedJson: (world: CustomWorld, expJ: string) => {
    if (isJsonString(expJ)) {
      setGlobalContext(world, 'ExpectedJson', expJ);
      ObjectFieldTakeContextCallbackFunc(world, JSON.parse(expJ), 'ExpectedJson', setGlobalContext);
    } else {
      setGlobalContext(world, 'ExpectedJson', expJ);
    }
  },
  getActualJson: (world: CustomWorld): string => getGlobalContext(world, "ActualJson"),
  setActualJson: (world: CustomWorld, actJ: string) => {
    if (isJsonString(actJ)) {
      setGlobalContext(world, 'ActualJson', actJ);
      ObjectFieldTakeContextCallbackFunc(world, JSON.parse(actJ), 'ActualJson', setGlobalContext);
    } else {
      setGlobalContext(world, 'ActualJson', actJ);
    }
  },
  getTolerantKeys: (world: CustomWorld): string[] => getGlobalContext(world, "TolerantKeys"),
  setTolerantKeys: (world: CustomWorld, tolKeys: string[]) => {
    setGlobalContext(world, "TolerantKeys", tolKeys);
    tolKeys.forEach(key => setGlobalContext(world, `TolerantKeys_${key}`, key));
  },
  getJsonDifferences: (world: CustomWorld,) => getGlobalContext(world, "JsonDifferences"),
  setJsonDifferences: (world: CustomWorld, jsonD: Difference[]) => {
    setGlobalContext(world, "JsonDifferences", jsonD);
  }
}

export const xmlContext = {
  getExpectedXml: (world: CustomWorld): string => getGlobalContext(world, "ExpectedXml"),
  setExpectedXml: (world: CustomWorld, expXml: string) => {
    const parser = new XMLParser({
      ignoreAttributes: false, // allow comparison of attributes
      attributeNamePrefix: '@_' // makes attributes easier to identify
    });
    try {
      ObjectFieldTakeContextCallbackFunc(world, parser.parse(expXml), 'ExpectedXml', setGlobalContext)
    } catch {
      console.error(`Error: Fail to set global contexts for xml fields`)
    }
    setGlobalContext(world, 'ExpectedXml', expXml);
  },
  getActualXml: (world: CustomWorld): string => getGlobalContext(world, "ActualXml"),
  setActualXml: (world: CustomWorld, actXml: string) => {
    const parser = new XMLParser({
      ignoreAttributes: false, // allow comparison of attributes
      attributeNamePrefix: '@_' // makes attributes easier to identify
    });
    try {
      ObjectFieldTakeContextCallbackFunc(world, parser.parse(actXml), 'ActualXml', setGlobalContext)
    } catch {
      console.error(`Error: Fail to set global contexts for xml fields`)
    }
    setGlobalContext(world, 'ActualXml', actXml);
  },
  getTolerantKeys: (world: CustomWorld): string[] => getGlobalContext(world, "TolerantKeys"),
  setTolerantKeys: (world: CustomWorld, tolKeys: string[]) => {
    setGlobalContext(world, "TolerantKeys", tolKeys);
    tolKeys.forEach(key => setGlobalContext(world, `TolerantKeys_${key}`, key));
  },
  getXmlDifferences: (world: CustomWorld) => getGlobalContext(world, "XmlDifferences"),
  setXmlDifferences: (world: CustomWorld, xmlD: Difference[]) => {
    setGlobalContext(world, "XmlDifferences", xmlD);
  }
}

export const databaseContext = {
  getConnectionString: (world: CustomWorld): string => getGlobalContext(world, "ConnectionString"),
  setConnectionString: (world: CustomWorld, connectionString: string) => {
    setGlobalContext(world, "ConnectionString", connectionString)
  },
  getDatabaseConn: (world: CustomWorld): DatabaseConnection => getGlobalContext(world, "DatabaseConnection"),
  setDatabaseConn: (world: CustomWorld, conn: DatabaseConnection) => {
    setGlobalContext(world, "DatabaseConnection", conn);
  },
  getSqlQuery: (world: CustomWorld) => getGlobalContext(world, "SqlQuery"),
  setSqlQuery: (world: CustomWorld, query: string) => setGlobalContext(world, "SqlQuery", query),
  getTolerantKeys: (world: CustomWorld): string[] => getGlobalContext(world, "TolerantKeys"),
  setTolerantKeys: (world: CustomWorld, tolKeys: string[]) => {
    setGlobalContext(world, "TolerantKeys", tolKeys);
    tolKeys.forEach(key => setGlobalContext(world, `TolerantKeys_${key}`, key));
  },
  getSqlResult: (world: CustomWorld): Record<string, any>[] => getGlobalContext(world, "SqlResult"),
  setSqlResult: (world: CustomWorld, sqlR: Record<string, any>[]) => {
    setGlobalContext(world, "SqlResult", sqlR);
  },
  getSqlDifferences: (world: CustomWorld) => getGlobalContext(world, "SqlDifferences"),
  setSqlDifferences: (world: CustomWorld, sqlD: Difference[]) => {
    setGlobalContext(world, "SqlDifferences", sqlD);
  }
}
