import { APIRequestContext, APIResponse, Browser, BrowserContext, Page } from "@playwright/test";
import { flattenObject } from '../helper/utilities';

let browser: Browser;
let browserContext: BrowserContext;
let page: Page;
let request: APIRequestContext;
let requestHeaders: Record<string, string>;
let requestParams: Record<string, string | number | boolean>;
let requestForm: Record<string, string | number | boolean>;
let response: APIResponse;
let responseJson: any;

export const globalContext: Record<string, any> = {};
export const setGlobalContext: <T>(key: string, value: T) => void = <T>(key: string, value: T) => {globalContext[key] = value;}
export const getGlobalContext: <T>(key: string) => T = <T>(key: string) : T => { return globalContext[key] as T; }

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
    requestForm = reqF
    Object.entries(reqF).forEach(([key, value]) => { setGlobalContext(`RequestForm_${key}`, value); });
  },
}

export const responseContext = {
  getResponse: () => response,
  setResponse: (resp: APIResponse) => {
    response = resp;
    setGlobalContext("Response", resp);
  },
  getResponseJson: () => responseJson,
  setResponseJson: (respJson: any) => {
    responseJson = respJson;
    for(const [key, value] of Object.entries(flattenObject(respJson))) {
      setGlobalContext(`ResponseJson_${key}`, value);
    }
  }
}
