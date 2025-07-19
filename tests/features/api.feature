@API_TEST
Feature: API tests

  @GET_API_REQUEST_JSON
  Scenario: test GET request Json
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products/2"

  @POST_API_REQUEST_JSON
  Scenario: test Post request Json
    Given I set the request data from file "../../tests/data/test_request.json"
    When I send POST request to url "https://dummyjson.com/products/add"

  @POST_API_REQUEST_XML
  Scenario: test Post request Xml
    Given I set the request headers as follow
      | Content-Type | text/xml                  |
      | SOAPAction   | http://tempuri.org/Divide |
    Given I set the request data from file "../../tests/data/test_request.xml"
    When I send POST request to url "http://www.dneonline.com/calculator.asmx"

  @GET_API_REQUEST_JSON_COMPARE
  Scenario: test GET request Json
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products/2"
    When I load in actual json from "{ResponseBody}"
    When I load in expected json from "../../tests/data/test_product_2.json"
    When I compare the expected and actual json from a specific json path "$.reviews"

  @POST_API_REQUEST_JSON_COMPARE
  Scenario: test Post request Json
    Given I set the request data from file "../../tests/data/test_request.json"
    When I send POST request to url "https://dummyjson.com/products/add"
    When I load in actual json from "{ResponseBody}"
    When I load in expected json from "{\"id\":195}"
    Then I compare the expected and actual json

  @POST_API_REQUEST_XML_COMPARE
  Scenario: test Post request Xml
    Given I set the request headers as follow
      | Content-Type | text/xml                  |
      | SOAPAction   | http://tempuri.org/Divide |
    Given I set the request data from file "../../tests/data/test_request.xml"
    When I send POST request to url "http://www.dneonline.com/calculator.asmx"
    When I load in actual xml from "{ResponseData}"
    When I load in expected xml from "../../tests/data/tes_soap_resp.xml"
    When I compare the expected and actual xml from a specific xml path '$.["soap:Envelope"]["soap:Body"]["DivideResponse"]'

  @GET_API_REQUEST_JSON_ASSERT
  Scenario: test GET request Json
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://jsonplaceholder.typicode.com/posts?id=6"
    When I load in actual json from "{ResponseBody}"
    When I assert the actual json under json path "$[*].title" to have value "dolorem eum magni eos aperiam quia" with type "string"

  @POST_API_REQUEST_XML_ASSERT
  Scenario: test Post request Xml
    Given I set the request headers as follow
      | Content-Type | text/xml                  |
      | SOAPAction   | http://tempuri.org/Divide |
    Given I set the request data from file "../../tests/data/test_request.xml"
    When I send POST request to url "http://www.dneonline.com/calculator.asmx"
    When I load in actual xml from "{ResponseData}"
    When I assert the actual xml under xml path '$.["soap:Envelope"]["soap:Body"]["DivideResponse"]["DivideResult"]' to have value '40' with type 'number'
