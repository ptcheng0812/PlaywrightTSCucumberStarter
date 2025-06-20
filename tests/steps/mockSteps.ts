//TODO: Mock steps

import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { requestContext, responseContext } from "../support/contexts";
import { expandVariablesDeepAsString } from "../support/variables";

When('I route to mock api {string} ', async function (this: CustomWorld, url: string) {
  const requestHeaders: { [key: string]: string } = requestContext.getRequestHeaders() || undefined;
  const requestData: string | undefined = requestContext.getRequestData() || undefined;
  const requestMethod: string | undefined = requestContext.getRequestMethod() || undefined;
  const requestMaxRedirects: number | undefined = requestContext.getRequestMaxRedirects() || undefined;
  const requestMaxRetries: number | undefined = requestContext.getRequestMaxRetries() || undefined;
  const requestTimeout: number | undefined = requestContext.getRequestTimeout() || undefined;

  const responseBody: string | Buffer<ArrayBufferLike> | undefined = responseContext.getResponseBody() || undefined;
  const responseData: string | undefined = responseContext.getResponseData() || undefined;
  const responseContentType: string | undefined = responseContext.getResponseContentType() || undefined;
  const responseHeaders: Record<string, string> | undefined = responseContext.getResponseHeaders() || undefined;
  const responsePath: string | undefined = responseContext.getResponsePath() || undefined;
  const responseStatus: number | undefined = responseContext.getResponseStatus() || undefined;

  await this.page.route(expandVariablesDeepAsString(url), async route => {
    const response = await route.fetch({
      headers: requestHeaders,
      maxRedirects: requestMaxRedirects,
      maxRetries: requestMaxRetries,
      timeout: requestTimeout,
      postData: requestData,
      method: requestMethod,
    });
    let jsonOriginal;
    try {
      jsonOriginal = await response.json();
    } catch (error) {

    }
    if (responseData == undefined || responseBody == undefined) { console.log('WARNING: Response Body or JSON is empty!'); }
    await route.fulfill({
      response: this.response ?? response,
      json: responseData ?? jsonOriginal,
      body: responseBody,
      contentType: responseContentType,
      headers: responseHeaders,
      path: responsePath,
      status: responseStatus
    });
  });
})
