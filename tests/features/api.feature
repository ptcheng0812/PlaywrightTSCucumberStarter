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
    When I load in actual xml from "{ResponseData}"
