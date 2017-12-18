'use strict';

// Define the `barGraph` directive that populates and updates the bar graph section
contentReportApp.directive('barGraph', barGraph);

function barGraph() {

  return {
    scope: true,
    restrict: 'E',
    templateUrl: 'angularjs/rep_app/bar-graph/bar-graph.template.html',
    controller: BarGraphController
  }
}