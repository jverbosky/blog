var speciesElements = $("#species_list").children(); // accordion buttons & panels
var orderList = "";
var locationList = "";


// Reset all species/sightings buttons/panels to default visible state
function resetReportElements() {

  $.each(speciesElements, function(sp_ind, sp_val) {

    var hiddenSightingsElements = $("#" + sp_val.id).find("[style*='display: none']");

    // make any hidden species elements visible
    sp_val.style.display = "";

    // make any hidden sightings elements visible
    $.each(hiddenSightingsElements, function(sg_ind, sg_val) {
      sg_val.style.display = "";
    });
  });
}


// Reset filter drop-downs and no_matching_records message, then call resetReportElements()
function resetReportFilters() {

  // hideMessaging();  // hide messaging divs

  $("#order_filter").val("All Orders");
  $("#location_filter").val("All Locations");
  $("#photos_filter").val("All Photos");
  $("#species_filter").val("All Species");
  $("#no_matching_records").addClass("div_hide");
  $("#species_filter").addClass("div_hide");

  resetReportElements();
  resizeReportPanels();
}


// Progressively resize panel heights for non-hidden panels from innermost to outermost
function resizeReportPanels() {

  // filter display for selected elements
  $.each(speciesElements, function(sp_ind, sp_val) {

    if (sp_ind % 2 === 0) {  // target the species buttons

      var speciesButton = $("#" + sp_val.id);
      var speciesPanel = speciesButton.next();
      var speciesPanelHeight = speciesPanel[0].style.maxHeight;
      var sightingsButtons = speciesPanel.find(":button");

      if (speciesPanelHeight !== "") {

        $.each(sightingsButtons, function(sg_ind, sg_val) {

          var sightingsButton = $("#" + sg_val.id);
          var sightingsPanel = sightingsButton.next();
          var sightingsPanelHeight = sightingsPanel[0].style.maxHeight;

          // resize sightings panel if expanded
          if (sightingsPanelHeight !== "") {
            panelResize(sightingsButton[0].id);
          }
        });

        // resize species panel if expanded
        panelResize(speciesButton[0].id);
      }
    }
  });

  // resize main panel now that other panels are adjusted
  adjustPanel("acc_report_filter");
}


// Populate the filter-by-order drop-down with a unique, sorted list of orders
function populateOrders() {

  var orderArray = JSON.parse(orderList);  // convert stringified array into array
  var uniqueOrders = [...new Set(orderArray)].sort();  // get unique names & sort
  var orders = "";

  $.each(uniqueOrders, function(index, value) {
    orders += '<option value="' + value + '">' + value + '</option>';
  });

  $('#order_filter').append(orders);
}


// Populate the filter-by-location drop-down with a unique, sorted list of locations
function populateLocations() {

  var locationArray = JSON.parse(locationList);  // convert stringified array into array
  var uniqueLocations = [...new Set(locationArray)].sort();  // get unique names & sort
  var locations = "";

  $.each(uniqueLocations, function(index, value) {
    locations += '<option value="' + value + '">' + value + '</option>';
  });

  $('#location_filter').append(locations);
}


// Create an array of species for all visible species buttons on the page
function getVisibleSpecies() {

  var speciesArray = [];
  var speciesElements = $(".accordion_species");  // all species buttons on the page

  speciesElements.each (function(index, value) {

    var speciesDisplayStyle = $(this).css("display");  // display style for the current species button

    if (speciesDisplayStyle === "inline-block") {  // if the button is visible

      var speciesPanel = $(this).next();
      var species = speciesPanel[0].getElementsByTagName("td")[0].innerText;

      speciesArray.push(species);
    }
  });

  return speciesArray;
}


// Populate the filter-by-species drop-down with a list of visible species
function populateSpecies() {

  var speciesArray = getVisibleSpecies();
  var species = "";
  var options = $("#species_filter option");
  var selectedOption = $('#species_filter option:selected').val();

  // remove any existing species from drop-down unless value selected
  if (selectedOption === "All Species") {

    options.slice(1, options.length).remove();

    $.each(speciesArray, function(index, value) {
      species += '<option value="' + value + '">' + value + '</option>';
    });

    $('#species_filter').append(species);
    
  } else {  // otherwise clear options and update filter with the selected option

    options.slice(1, options.length).remove();
    species += '<option value="' + selectedOption + '">' + selectedOption + '</option>';
    $('#species_filter').append(species);
    $("#species_filter").val(selectedOption);
  }
}


// Filter the species by the selected order
function filterOrder(order) {

  if (order !== "All Orders") {

    // filter display for selected elements
    $.each(speciesElements, function(sp_ind, sp_val) {

      var speciesButton = $("#" + sp_val.id);
      var speciesPanel = speciesButton.next();

      // target the species buttons
      if (sp_ind % 2 === 0) {

        if (sp_val.name !== order) {
          speciesButton[0].style.display = "none";
          speciesPanel[0].style.display = "none";
        }            
      }
    });
  }
}


// Filter the species by the selected location
function filterLocation(location) {

  if (location !== "All Locations") {

    // filter display for selected elements
    $.each(speciesElements, function(sp_ind, sp_val) {

      // target the species buttons
      if (sp_ind % 2 === 0) {

        var speciesButton = $("#" + sp_val.id);
        var speciesPanel = speciesButton.next();
        var sightingsButtons = speciesPanel.find(":button");
        var visibleButtons = 0;

        $.each(sightingsButtons, function(sg_ind, sg_val) {

          var sightingsButton = $("#" + sg_val.id);
          var sightingsPanel = sightingsButton.next();
          var locationCell = sightingsButton.next().find("td:first").text();

          if (locationCell === location) {
            visibleButtons += 1;
          } else {
            sightingsButton[0].style.display = "none";
            sightingsPanel[0].style.display = "none";
          }
        });

        // if all inner buttons are hidden, hide the species button
        if (visibleButtons === 0) {
          speciesButton[0].style.display = "none";
          speciesPanel[0].style.display = "none";
        }
      }
    });
  }
}


// Filter sightings elements when Multiple Photos option is selected
function filterMultiplePhotos(photoCells, sightingsButton, sightingsPanel) {

  if (photoCells <= 1) {

    sightingsButton[0].style.display = "none";
    sightingsPanel[0].style.display = "none";
    return 0;

  } else {

    return 1;
  }
}


// Filter sightings elements when Single Photo option is selected
function filterSinglePhoto(photoCells, sightingsButton, sightingsPanel) {

  if (photoCells !== 1) {

    sightingsButton[0].style.display = "none";
    sightingsPanel[0].style.display = "none";
    return 0;

  } else {

    return 1;
  }
}


// Filter sightings elements when No Photos option is selected
function filterNoPhotos(photoCells, sightingsButton, sightingsPanel) {

  if (photoCells !== 0) {

    sightingsButton[0].style.display = "none";
    sightingsPanel[0].style.display = "none";
    return 0;

  } else {

    return 1;
  }
}


// Filter the species by the selected photos option
function filterPhotos(option) {

  if (option !== "All Photos") {

    // filter display for selected elements
    $.each(speciesElements, function(sp_ind, sp_val) {

      // target the species buttons
      if (sp_ind % 2 === 0) {

        var speciesButton = $("#" + sp_val.id);
        var speciesPanel = speciesButton.next();
        var sightingsButtons = speciesPanel.find(":button");
        var visibleButtons = 0;

        $.each(sightingsButtons, function(sg_ind, sg_val) {

          var sightingsButton = $("#" + sg_val.id);
          var sightingsPanel = sightingsButton.next();
          var photoCells = sightingsButton.next().find("img").length;

          if (option === "Multiple Photos") {
            visibleButtons += filterMultiplePhotos(photoCells, sightingsButton, sightingsPanel);
          } else if (option === "Single Photo") {
            visibleButtons += filterSinglePhoto(photoCells, sightingsButton, sightingsPanel);
          } else if (option === "No Photos") {
            visibleButtons += filterNoPhotos(photoCells, sightingsButton, sightingsPanel);
          }
        });

        // if all inner buttons are hidden, hide the species button
        if (visibleButtons === 0) {
          speciesButton[0].style.display = "none";
          speciesPanel[0].style.display = "none";
        }
      }
    });
  }
}


// Filter the species by the selected species name
function filterSpecies(species) {

  var speciesCounter = 1;

  if (species !== "All Species") {

    // filter display for selected elements
    $.each(speciesElements, function(sp_ind, sp_val) {

      // skip panel element so speciesCounter lines up
      if (sp_ind % 2 === 0) {

        var speciesButton = $("#" + sp_val.id);
        var speciesPanel = speciesButton.next();

        // get the species common name
        var speciesId = "#species_cname_" + speciesCounter;
        var panelSpecies = $(speciesId).text();

        // hide species elements if no match on species name
        if (panelSpecies !== species) {
          speciesButton[0].style.display = "none";
          speciesPanel[0].style.display = "none";
        }

        speciesCounter += 1;
      }
    });
  }
}


// Hide species button if all sightings buttons are hidden
function evaluateSightingsElements() {

  // filter display for selected elements
  $.each(speciesElements, function(sp_ind, sp_val) {

    // target the species buttons
    if (sp_ind % 2 === 0) {

      var speciesButton = $("#" + sp_val.id);
      var speciesPanel = speciesButton.next();
      var sightingsButtons = speciesPanel.find(":button");
      var visibleButtons = 0;

      $.each(sightingsButtons, function(sg_ind, sg_val) {

        var sightingsButton = $("#" + sg_val.id);
        var sightingsButtonDisplayStyle = sightingsButton[0].style.display;

        // if any sightings buttons are visible, increment visibleButtons
        if (sightingsButtonDisplayStyle !== "none") {
          visibleButtons += 1;
        }
      });

      // if all inner buttons are hidden, hide the species button
      if (visibleButtons === 0) {
        speciesButton[0].style.display = "none";
        speciesPanel[0].style.display = "none";
      }
    }
  });
}


// Conditionally display/hide species filter based on other filter values
function displaySpeciesFilter(filtersArray) {

  // var defaultFilters = ["All Orders", "All Locations", "All Auditors"];
  var defaultFilters = ["All Orders", "All Locations", "All Photos"];
  var arrayDifference = $(filtersArray).not(defaultFilters);  // check for non-defaults

  if (arrayDifference.length > 0) {

    $("#species_filter").removeClass("div_hide");
    populateSpecies();

  } else {

    $("#species_filter").addClass("div_hide");
  }
}


// Message if there are no matching species for the filter set
function evaluateMessage() {

  var visibleElementsCount = 0;

  // determine count of visible accordion buttons and panels
  $.each(speciesElements, function(sp_ind, sp_val) {
    if (sp_val.style.display === "") { 
      visibleElementsCount += 1; 
    }
  });

  // add message if no accordion buttons visible
  if (visibleElementsCount === 0) {
    $("#no_matching_records").removeClass("div_hide");
  } else {
    $("#no_matching_records").addClass("div_hide");
  }
}


// Apply specified filter set to all species buttons
function applyReportFilters() {

  // hideMessaging();  // hide messaging divs

  // collect filter drop-down values
  var orderFilterValue = $('#order_filter option:selected').val();
  var locationFilterValue = $('#location_filter option:selected').val();
  var photosFilterValue = $('#photos_filter option:selected').val();
  var speciesFilterValue = $('#species_filter option:selected').val();

  // progressively call helper functions to reset and filter appropriately
  resetReportElements();
  filterOrder(orderFilterValue);
  filterLocation(locationFilterValue);
  filterPhotos(photosFilterValue);

  // review sightings elements to determine if species elements should be hidden
  evaluateSightingsElements();

  // conditionally display the species filter
  displaySpeciesFilter([orderFilterValue, locationFilterValue, photosFilterValue]);

  // if species filter is visible
  if ($("#species_filter").hasClass("div_hide") === false) {
    filterSpecies(speciesFilterValue);   
  }

  // determine if any messaging is necessary
  evaluateMessage();

  // resize all panels from innermost to outermost
  resizeReportPanels();
}


// Configures height for correspondingpanel div when accordion button is clicked
function setupAccordionsSightings() {

  var accordions = [$(".accordion_species"), $(".accordion_sighting")];

  $.each(accordions, function(index, value) {

    var acc = accordions[index];

    for (var i = 0; i < acc.length; i++) {

      acc[i].onclick = function() {

        this.classList.toggle("active");
        var panel = this.nextElementSibling;

        // need to resize panel height of parent accordion panel after exposure panel is resized
        var auditPanel = this.parentElement;

        if (panel.style.maxHeight){
      
          panel.style.maxHeight = null;
      
        } else {
      
          panel.style.maxHeight = panel.scrollHeight + "px";

          if (acc === accordions[1]) {
            auditPanel.style.maxHeight = auditPanel.scrollHeight + "px";
          }

          panelResize("acc_report_filter");
          var id = "#" + this.id
          doScrolling(id, 800);
        } 
      }
    }
  });
}


// Initialize items once HTML document is ready
$(document).ready(function() {

  // setup the audit and exposure accordions
  setupAccordionsSightings();

  // collect data arrays from show_all_audits.erb (lines 787 - 788)
  orderList = $("#order_list").text();
  locationList = $("#location_list").text();

  // populate the dynamic filter drop-downs
  populateOrders();
  populateLocations();
});