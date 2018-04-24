'use strict';

// Define the `TotalsController` controller that handle logic for calculating total counts
contentReportApp.controller(
  'TotalsController',
  ['$scope', TotalsController]  // dependencies in array for minification
);

function TotalsController($scope) {

  init();

  function init() {

    if ($scope.values !== undefined) {  // check if promise is unwrapped

      filterData($scope);

    } else {  // retry if not

      setTimeout(function() {
        init();
      }, 100);
    }
  }


  // Helper function for sumData
  function sum(total, num) {

    return total + num;
  }


  // Calculate sum of all data in provided array (channels, devices)
  function sumData(data) {

    return data.reduce(sum);
  }


  // Create & sum arrays of channel and device values
  function filterData($scope) {

    let channels = [];
    let devices = [];

    // single iteration to capture both values
    Object.values($scope.values).forEach(function(value) {
      channels.push(value["Channels"]);
      devices.push(value["Devices"]);
    });

    $scope.total_channels = sumData(channels);
    $scope.total_devices = sumData(devices);
  }
}