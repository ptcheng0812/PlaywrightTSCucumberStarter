@FILE_TEST
Feature: File Export tests

  @EXPORT_TO_XLSX
  Scenario: Export to xlsx
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products"
    When I export data "{ResponseData.products}" to file path "../../tests/data/test_products_actual.xlsx"

  @EXPORT_TO_CSV
  Scenario: Export to xlsx
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products"
    When I export data "{ResponseData.products}" to file path "../../tests/data/test_products_actual.csv"

  @EXPORT_TO_JSON
  Scenario: Export to xlsx
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products"
    When I export data "{ResponseData.products}" to file path "../../tests/data/test_products_actual.json"

  @EXPORT_TO_XML
  Scenario: Export to xlsx
    Given I set the request headers as follow
      | Accept | */* |
    When I send GET request to url "https://dummyjson.com/products"
    When I export data "{ResponseData.products}" to file path "../../tests/data/test_products_actual.xml"

  @COMPARE_XLSX
  Scenario: Compare xlsx
    Then I compare expected xlsx from file path "../../tests/data/test_products_expected.xlsx" to actual xlsx from path "../../tests/data/test_products_actual.xlsx"

  @COMPARE_CSV
  Scenario: Compare csv
    Then I compare expected csv from file path "../../tests/data/test_products_expected.csv" to actual csv from path "../../tests/data/test_products_actual.csv"
