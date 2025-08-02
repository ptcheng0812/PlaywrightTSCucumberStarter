//TODO: Mock steps

import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { mockServerContext, requestContext, responseContext } from "../support/contexts";
import { expandVariables } from "../support/variableUtils";
import { WireMockRestClient } from "wiremock-rest-client";
import { isJsonString, isXmlString, xmlParser } from '../support/commonUtils';

When('I route to mock api {string} using playwright', async function (this: CustomWorld, url: string) {
  const requestHeaders: { [key: string]: string } = requestContext.getRequestHeaders(this) || undefined;
  const requestData: string | undefined = requestContext.getRequestData(this) || undefined;
  const requestMethod: string | undefined = requestContext.getRequestMethod(this) || undefined;
  const requestMaxRedirects: number | undefined = requestContext.getRequestMaxRedirects(this) || undefined;
  const requestMaxRetries: number | undefined = requestContext.getRequestMaxRetries(this) || undefined;
  const requestTimeout: number | undefined = requestContext.getRequestTimeout(this) || undefined;

  const responseBody: string | Buffer<ArrayBufferLike> | undefined = responseContext.getResponseBody(this) || undefined;
  const responseData: string | undefined = responseContext.getResponseData(this) || undefined;
  const responseContentType: string | undefined = responseContext.getResponseContentType(this) || undefined;
  const responseHeaders: Record<string, string> | undefined = responseContext.getResponseHeaders(this) || undefined;
  const responsePath: string | undefined = responseContext.getResponsePath(this) || undefined;
  const responseStatus: number | undefined = responseContext.getResponseStatus(this) || undefined;

  await this.page.route(expandVariables(this, url), async route => {
    const response = await route.fetch({
      headers: requestHeaders,
      maxRedirects: requestMaxRedirects,
      maxRetries: requestMaxRetries,
      timeout: requestTimeout,
      postData: requestData,
      method: requestMethod,
    });
    // let jsonOriginal;
    // try {
    //   jsonOriginal = await response.json();
    //   jsonOriginal["Europe"][0]["name"] = "UK"
    //   jsonOriginal["Europe"][0]["link"] = "overseas-property/in-UK.html"
    // } catch (error) {

    // }
    // if (responseData == undefined || responseBody == undefined) { console.log('WARNING: Response Body or JSON is empty!'); }
    await route.fulfill({
      response: this.response ?? response,
      json: responseData,
      body: responseBody,
      contentType: responseContentType,
      headers: responseHeaders,
      path: responsePath,
      status: responseStatus
    });
  });
})

When('I mock api {string} using wiremock', async function (this: CustomWorld, api: string) {
  const requestHeaders: { [key: string]: string } = requestContext.getRequestHeaders(this) || undefined;
  const requestParams: Record<string, string | number | boolean> = requestContext.getRequestParams(this) || undefined;
  const requestData: string | undefined = requestContext.getRequestData(this) || undefined;
  const requestMethod: string | undefined = requestContext.getRequestMethod(this) || undefined;
  const requestCookies: Record<string, any> = requestContext.getRequestCookies(this) || undefined;
  const basicHttpAuthCredentials: { [k: string]: any; password: string; username: string; } = requestContext.getBasicHttpAuthCredentials(this) || undefined;

  const responseBody: string | Buffer<ArrayBufferLike> = responseContext.getResponseBody(this) || "";
  const responseData: string | undefined = responseContext.getResponseData(this) || undefined;
  const responseHeaders: Record<string, string> | undefined = responseContext.getResponseHeaders(this) || undefined;
  const responseStatusMessage: string | undefined = responseContext.getResponseStatusMessage(this) || undefined;
  const responseStatus: number | undefined = responseContext.getResponseStatus(this) || undefined;
  const responseDelayMilliseconds: number | undefined = responseContext.getResponseDelayMilliseconds(this) || undefined;

  let bodyPattern: string;
  if (requestData != undefined && isJsonString(requestData)) {
    bodyPattern = "equalToJson";
  } else if (requestData != undefined && isXmlString(requestData)) {
    bodyPattern = "equalToXml";
  } else if (requestData != undefined && !isXmlString(requestData) && !isJsonString(requestData)) {
    bodyPattern = "contains"
  }
  else { console.error("Empty request data!"); }


  const client: WireMockRestClient = mockServerContext.getWireMockClient(this);
  await client.mappings.createMapping({
    "request": {
      "method": requestMethod,
      "urlPathPattern": api,
      "queryParameters": requestParams,
      "headers": requestHeaders,
      "cookies": requestCookies,
      "basicAuthCredentials": basicHttpAuthCredentials,
      "bodyPatterns": requestData != undefined ? [{
        bodyPattern: requestData,
        "ignoreArrayOrder": true,
        "ignoreExtraElements": true
      }] : undefined
    },
    "response": {
      "status": responseStatus,
      "statusMessage": responseStatusMessage,
      "fixedDelayMilliseconds": responseDelayMilliseconds,
      "headers": responseHeaders,
      "jsonBody": responseData != undefined && isJsonString(responseData?.toString()) ? JSON.parse(responseData) : undefined,
      "body": responseBody.toString()
    }
  });
})
