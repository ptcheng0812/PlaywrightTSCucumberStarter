Feature: Mock

  @MOCK_PLAYWRIGHT
  Scenario: Modify Country with Mocks API
    Given I set the request headers as follow
      | Accept | */* |
    Given I set the response body from file "../../tests/data/mock_page.html"
    When I route to mock api "https://www.rightmove.co.uk/commercial-property" using playwright
    When I visit commercial-property page and assert mock locator
