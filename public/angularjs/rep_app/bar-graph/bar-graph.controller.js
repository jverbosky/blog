'use strict';

// Define the `UpdateBarGraph` controller that handles logic for bar graph population and updates
contentReportApp.controller('UpdateBarGraph', UpdateBarGraph);

function UpdateBarGraph($scope) {

  init();

  function init() {

    if ($scope.clength !== undefined) {  // check if promise is unwrapped

      evaluateBarElements($scope);

    } else {  // retry if not

      setTimeout(function() {
        init();
      }, 100);
    }
  }


  // Resize the bars based on the count value (CSS transition eases change)
  function resizeBars($scope, barElements, visibleBars) {

    if (barElements.length === visibleBars) {

      for(let i=0,l=barElements.length;i<l;i++) {

        // create offset so 0-sized bars still display
        let barSize = Number(barElements[i].innerHTML) + 20;
        barElements[i].style.width = barSize + "px";
      }

    } else {  // the elements are still loading, so try again in 100ms

      setTimeout(function() {
        resizeBars($scope, barElements, visibleBars);
      }, 100);
    }
  }


  // Verify selected country is available before calling resizeBars()
  function evaluateCountry($scope, barElements, visibleBars) {

    let countryVal = barElements[0].parentNode.previousElementSibling.innerHTML;

    if (countryVal === $scope.targetCountry) {

      resizeBars($scope, barElements, visibleBars)

    } else {  // the elements are still loading, so try again in 100ms

      setTimeout(function() {
        evaluateCountry($scope, barElements, visibleBars)
      }, 100);
    }
  }


  // Calculate number of visible bars (all countries / single country)
  function calculateVisibleBars($scope) {

    let visibleBars = 0;

    if ($scope.targetCountry === undefined || $scope.targetCountry === null) {
      visibleBars = $scope.clength * 2;
    } else {
      visibleBars = 2;
    }

    return visibleBars;
  }


  // Evaluate bar elements for handling div resizing
  function evaluateBarElements($scope) {

    let barElements = document.getElementsByClassName('chart');
    let visibleBars = calculateVisibleBars($scope);

    // if single country, capture values for related bars
    if (visibleBars === 2) {
      evaluateCountry($scope, barElements, visibleBars);
    } else {  // otherwise resize all bars
      resizeBars($scope, barElements, visibleBars);
    }
  }
  
}