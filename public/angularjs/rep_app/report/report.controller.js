'use strict';

// Define the `ReportController` controller that handles logic for updating the page
contentReportApp.controller(
  'ReportController', 
  ['$scope', 'jsonService', ReportController]  // dependencies in array for minification
);

function ReportController($scope, jsonService) {

  init();

  function init() {

    // retrieve promise from jsonService
    var jsonData = jsonService.getJson();

    // unwrap JSON file from promise then call helper controllers
    jsonData.then(function (response) {
      
      $scope.values = response.data;
      JsonFilterController($scope);  // parse & update JSON data
      TotalsController($scope);  // calculate total counts
      BarGraphController($scope);  // draw bar graphs
    })
  }


  // Update filter target and make call to redraw bar graph(s)
  $scope.change = function() {

    // reset targetCountry to display all countries when "All" is selected
    if ($scope.targetCountry === null) {
      $scope.targetCountry = undefined;
    }

    BarGraphController($scope);  // redraw bar graphs
  }
}