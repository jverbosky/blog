'use strict';

// Define the `totalCounts` directive that populates and updates the total counts section
contentReportApp.directive('totalCounts', totalCounts);

function totalCounts() {

  return {
    scope: true,
    restrict: 'E',
    templateUrl: 'angularjs/rep_app/totals/totals.template.html',
    controller: CalculateTotals
  }
}