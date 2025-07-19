Feature: User Authentication tests

  @ui @UITest_NavigateHomePage
  Scenario: 001 Navigate Home Page
    Given I navigate to home page

  @ui @UITest_SearchPlacesInLondon
  Scenario: 002 Search Place in London
    Given I navigate to home page
    When I search place for sale
