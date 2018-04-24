'use strict';

// Define the jsonService service that retrieves JSON data
jsonHelper.service(
  'jsonService',
  ['$http', jsonService]  // dependencies in array for minification
);

function jsonService($http) {

  this.getJson = function() {
    return $http.get('angularjs/rep_app/json//data.json');
  }
}