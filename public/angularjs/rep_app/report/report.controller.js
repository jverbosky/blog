'use strict';

// Define the `PopulateReport` controller that handles logic for updating the page
contentReportApp.controller('PopulateReport', PopulateReport);

function PopulateReport($scope, jsonService) {

  init();

  function init() {

    // retrieve promise from jsonService
    var jsonData = jsonService.getJson();

    // unwrap JSON file from promise then call helper controllers
    jsonData.then(function (response) {
      
      $scope.values = response.data;
      FilterJsonData($scope);  // - /json/json-filter.controller.js
      CalculateTotals($scope);  // - /totals/totals.controller.js
      UpdateBarGraph($scope);  // - /bar-graph/bar-graph.controller.js
    })
  }


  // Call helper function and controller
  $scope.change = function() {

    filterCountry();
    UpdateBarGraph($scope);  // - /bar-graph/bar-graph.controller.js
  }


  // Create object with details for selected country for filtered listing
  function filterCountry() {

    // only run when a single country is selected
    if ($scope.targetCountry !== null) {

      $scope.countryDetails = {"country": $scope.targetCountry};
      $scope.countryDetails["channel"] = $scope.values[$scope.targetCountry]["Channels"];
      $scope.countryDetails["device"] = $scope.values[$scope.targetCountry]["Devices"];
    }
  }
}