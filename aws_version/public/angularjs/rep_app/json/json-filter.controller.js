'use strict';

// Define the `JsonFilterController` controller that handles logic for JSON data processing
contentReportApp.controller(
  'JsonFilterController',
  ['$scope', JsonFilterController]  // dependencies in array for minification 
);

function JsonFilterController($scope) {

  init();

  function init() {

    let json = $scope.values;

    if (json !== undefined) {  // check if promise is unwrapped

      createCountriesArray($scope, json);
      handleMissingCountryArray($scope);
      handleMissingCountryJson($scope, json);
      flattenJson($scope);      
    
    } else {  // retry if not

      setTimeout(function() {
        init();
      }, 100);
    }
  }


  // Create array of countries from JSON data
  function createCountriesArray($scope, json) {

    $scope.countries = Object.keys(json);
    $scope.clength = $scope.countries.length;
  }


  // Update missing country name in $scope.countries array for filter
  function handleMissingCountryArray($scope) {

    for(let i=0,l=$scope.clength;i<l;i++) {

      // replace empty string so easy to see, keep totals intact
      if ($scope.countries[i] === "") {
        
        $scope.countries[i] = "-Missing Country-";
      }
    }
  }


  // Update missing country name in json
  function handleMissingCountryJson($scope, json) {

    $scope.values = {};

    for(let i=0,l=$scope.clength;i<l;i++) {

      if ($scope.countries[i] === "-Missing Country-") {

        // replace empty string so easy to see, keep totals intact
        $scope.values["-Missing Country-"] = json[""];

      } else {

        $scope.values[$scope.countries[i]] = json[$scope.countries[i]];
      }
    }
  }


  // Create array of flattened object (country, channel #, device #)
  function flattenJson($scope) {

    $scope.flattened = [];

    for(let i=0,l=$scope.clength;i<l;i++) {

      let key = $scope.countries[i];

      $scope.flattened.push({
        "country": key,
        "channel": $scope.values[key]["Channels"],
        "device": $scope.values[key]["Devices"]
      })
    }
  }

}