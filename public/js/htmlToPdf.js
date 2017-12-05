var outputType = "";  // holds string (file, email) to trigger PDF output
var speciesQueue = [];  // holds visible species accordions for sending to createPDF()
var processingMessage;  // global for resetting after PDF data POSTed to Sinatra
var targetEmail = "";  // email address to send PDF to (if specified)


// Sends AJAX request to remove sighting image directories from ./public/swap
function cleanupSwap() {

  $.ajax({
      url: "/purge_swap_dir",
      type: 'POST',
      data: { purge_images: "yes" },  // not used, just a trigger
      success: function(result) {}
  });
}


// Remove completed species and start processing the next one in queue
function trimSpeciesQueue() {

  speciesQueue.shift();  // remove current PDF from speciesQueue

  if (speciesQueue.length > 0) {  // if there are more species in the queue

    createPdf(speciesQueue[0]);  // process the next one

  } else {

    outputType = "";  // reset outputType for subsequent operations
    cleanupSwap();  // purge cached sighting directories from ./public/swap
  }
}


// POST the current PDF to Sinatra via an AJAX request
function postPdf(pdf, pdfFilename) {

  var pdfFile = pdf.output('datauristring');  // convert PDF object to base64 string

  $.ajax({
    url: "/email_pdf",
    type: 'POST',
    data: {pdf_data: pdfFile, pdf_filename: pdfFilename, email: targetEmail},
    success: function(data, status, xhr) {

      $("#pdf_in_progress").addClass("div_hide");  // hide the in progress div
      $("#pdf_email_target").addClass("div_hide");  // hide the email address input div
      clearTimeout(processingMessage);  // stop the setTimeout function in pdfProcessing()
      $("#pdf_emailed").removeClass("div_hide");  // advise that email has been sent
      resizeReportPanels();
    }
  });

  trimSpeciesQueue();
}


// Save the current PDF to file, then call trimSpeciesQueue()
function savePdf(pdf, pdfFilename) {

  $("#pdf_in_progress").addClass("div_hide");  // hide the in progress div

  pdf.save(pdfFilename);
  trimSpeciesQueue();
}


// Output the current PDF based on the specified output type
function outputPdf(pdf, pdfFilename) {

  if (outputType === "file") {

    savePdf(pdf, pdfFilename);
  
  } else if (outputType === "email") {

    postPdf(pdf, pdfFilename);
  }
}


// Creates jsPDF object based on tables and images for current species and sighting(s)
function createPdf(speciesButton) {

  // PDF file variables
  var pdfHeader = "";  // stored here to facilitate update/access via setupPdfFormat() and addSpeciesTable()
  var pdfFilename = "";  // stored here to facilitate update/access via pdfFilename() and calls to savePdf()
  var currentY = 0;  // used to position images and tables after images have been added

  // Audit processing variables used to track tables for conditional processing and lookaheads
  var speciesTableTypes = [];  // used for image table lookahead in addNotesTable()
  var sightingsTablesQueue = {};  // container for all sightings tables and associated images
  var sightingsButtonsCount = 0;  // # of sightings for current species, conditionally savePdf() in addDescriptionTable()
  var totalSightingsButtons = 0;  // static count of sightings, conditionally savePdf() in addNotesTable()
  var currentSightingsCount = 0;  // used to populate sightingsTablesQueue during iterations
  var processedSightings = 0;  // conditionally call savePdf() in addNotesTable() and addImages()
  var totalImagesCount = 0;  // conditionally call processSightingsTablesQueue() in queueImages()
  var queuedImages = 0;  // compared against totalImages count to conditionally call processSightingsTablesQueue() in queueImages()
  var imageTablesCount = 0;  // conditionally call savePdf() in addDescriptionTable() and addNotesTable()

  // Image placement variables
  var pageWidth = 0;  // PDF page width used to calculate image placement
  var pageHeight = 0;  // PDF page height used to generate new page if images will run off bottom
  var imgStartX = 0;  // stored here to facilitate update/access while iterating in addImages()
  var imgStartY = 0;  // stored here to facilitate update/access while iterating in addImages()
  var imgWidth = 0;  // stored here to facilitate storing during callback in queueImages()
  var imgHeight = 0;  // stored here to facilitate storing during callback in queueImages()


  // Add location table to the PDF
  function addSpeciesTable(pdf, res) {

    pdf.autoTable(res.columns, res.data, {
      addPageContent: pdfHeader,
      headerStyles: {fillColor: [204, 204, 204]},
      margin: {
        top: 70
      },
      tableWidth: 'auto',
      columnWidth: 'auto',
      styles: {
        overflow: 'linebreak'
      }
    });

    speciesTableTypes.shift();
  }


  // Add descript table to the PDF
  function addDescriptionTable(pdf, res) {

    var descTableStartY = pdf.autoTable.previous.finalY + 10;  // subsequent tables follow previous

    pdf.autoTable(res.columns, res.data, {
      startY: descTableStartY,
      headerStyles: {fillColor: [204, 204, 204]},
      tableWidth: 'auto',
      columnWidth: 'auto',
      styles: {
        overflow: 'linebreak'
      }
    });

    speciesTableTypes.shift();

    // if there are no sightings, save the PDF
    if (imageTablesCount === 0 && sightingsButtonsCount === 0) {
      outputPdf(pdf, pdfFilename);
    }
  }


  // Add location table to the PDF
  function addLocationTable(pdf, res) {

    var locTableStartY = 0;
    var sighting = processedSightings + 1;

    if (processedSightings === 0) {
      locTableStartY = pdf.autoTable.previous.finalY + 25  // subsequent tables follow previous      
    } else {
      locTableStartY = currentY + 25;
    }

    pdf.setFontSize(14);
    pdf.text("Sighting " + sighting, 40, locTableStartY);
    pdf.autoTable(res.columns, res.data, {
      startY: locTableStartY + 10,
      headerStyles: {fillColor: [204, 204, 204]},
      tableWidth: 'auto',
      columnWidth: 'auto',
      styles: {
        overflow: 'linebreak'
      }
    });
  }


  // Add notes table to the PDF
  function addNotesTable(pdf, res) {

    var notesTableStartY = pdf.autoTable.previous.finalY + 10;  // subsequent tables follow previous

    pdf.autoTable(res.columns, res.data, {
      startY: notesTableStartY,
      headerStyles: {fillColor: [204, 204, 204]},
      tableWidth: 'auto',
      styles: {
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { columnWidth: 'auto' },
        1: { columnWidth: 150 }
      }
    });

    currentY = pdf.autoTable.previous.finalY;  // store Y position after adding table

    // if there are no images for this sighting, reduce sightingsButtonsCount and increment processedSightings
    if (speciesTableTypes[1] === "Empty Image Table") {
      sightingsButtonsCount -= 1;
      processedSightings += 1;
    }

    // if there are no images for the sighting and this is the final sighting, save the PDF
    if (processedSightings === totalSightingsButtons && imageTablesCount === 0) {
      outputPdf(pdf, pdfFilename);
    }
  }


  // Create an array for each row of images
  function calculateRows(imgQ) {

    var imgRowSets = [];
    var currentRow = [];
    var rowWidth = 80;  // margins on left and right sides of page

    $.each(imgQ, function(index, value) {

      currentImgWidth = value[2];

      if (rowWidth + currentImgWidth < pageWidth) {

        rowWidth += currentImgWidth + 20;
        currentRow.push(value);

      } else {  // start a new row if the image will run off the right side of the page

        imgRowSets.push(currentRow);
        currentRow = [];
        rowWidth = currentImgWidth + 100;  // margins and space between next picture
        currentRow.push(value);
      }

    });

    imgRowSets.push(currentRow);  // push the final currentRow into imgRowSets

    return imgRowSets;
  }


  // Create an array of image heights for each row
  function collectRowHeights(imgRowSets) {

    var rowHeights = [];
    var maxRowHeights = [];

    $.each(imgRowSets, function(irs_ind, irs_val) {

      var currentRowHeights = [];

      $.each(irs_val, function(img_ind, img_val) {

        currentRowHeights.push(img_val[3]);
      });

      rowHeights.push(currentRowHeights);
      currentRowHeights = [];
    });

    return rowHeights;
  }


  // Create an array of maximum image heights for each row
  function calculateMaxRowHeights(rowHeights) {

    maxRowHeights = [];

    $.each(rowHeights, function(index, value) {

      var maxHeight = value.reduce(function(a, b) { return Math.max(a, b); });

      maxRowHeights.push(maxHeight);
    });

    return maxRowHeights;
  }


  // Calculate leading margin so images appear centered
  function calculateMargin(imgRowSet) {

    rowWidth = -20;  // offset for final image margin

    $.each(imgRowSet, function(index, value) {
      rowWidth += value[2] + 20;
    });
      
    return (pageWidth - rowWidth) / 2;
  }


  // Add images to the PDF
  function addImages(pdf, imgQ) {

    var imgRowSets = calculateRows(imgQ);
    var rowHeights = collectRowHeights(imgRowSets);
    var maxRowHeights = calculateMaxRowHeights(rowHeights);
    imgStartY = currentY + 10;

    $.each(imgRowSets, function(irs_ind, irs_val) {

      var currentRow = irs_val;

      if (imgStartY + maxRowHeights[irs_ind] + 10 > pageHeight) {  // determine if images go off page
        pdf.addPage();
        imgStartY = 40;
      }

      imgStartX = calculateMargin(irs_val);  // recalculate to center images

      $.each(currentRow, function(cr_ind, cr_val) {  // add images for the current row to the PDF

        var pdfImgBase64 = cr_val[0];
        var pdfImgType = cr_val[1];
        var imgWidth = cr_val[2];
        var imgHeight = cr_val[3];

        pdf.addImage(pdfImgBase64, pdfImgType, imgStartX, imgStartY, imgWidth, imgHeight);
        imgStartX += imgWidth + 20;

      });

      imgStartY += maxRowHeights[irs_ind] + 10;
    });

    imageTablesCount -= 1;  // decrement the number of image tables in sighting
    processedSightings += 1;
    currentY = imgStartY;  // update currentY for sightings table positioning

    if (processedSightings === totalSightingsButtons) {
      outputPdf(pdf, pdfFilename);
    }
  }


  // Process location table, notes table and images in sightingsTablesQueue array
  function processSightingsTablesQueue(pdf) {

    for (var sightingCount in sightingsTablesQueue) {

      while (sightingsTablesQueue[sightingCount]) {

        if (sightingsTablesQueue[sightingCount][0][0] === "addLocationTable") {

          addLocationTable(sightingsTablesQueue[sightingCount][0][1], sightingsTablesQueue[sightingCount][0][2]);
          speciesTableTypes.shift();
          sightingsTablesQueue[sightingCount].shift();

        } else if (sightingsTablesQueue[sightingCount][0][0] === "addNotesTable") {

          addNotesTable(sightingsTablesQueue[sightingCount][0][1], sightingsTablesQueue[sightingCount][0][2]);
          speciesTableTypes.shift();

          // remove "Empty Image Table" item from beginning of speciesTableTypes if present
          if (speciesTableTypes[0] === "Empty Image Table") {
            speciesTableTypes.shift();
          }

          sightingsTablesQueue[sightingCount].shift();

        } else if (sightingsTablesQueue[sightingCount][0][0] === "imagesQueue") {

          addImages(pdf, sightingsTablesQueue[sightingCount][0][1]);
          speciesTableTypes.shift();
          sightingsTablesQueue[sightingCount].shift();
        }

        // remove sightingsTablesQueue property after all arrays have been processed
        if (sightingsTablesQueue[sightingCount].length === 0) {
          delete sightingsTablesQueue[sightingCount];
        }
      }
    }
  }


  // Queue images for the PDF
  function queueImages(pdf, currentTable, currentSightingsCount) {

    var imageElements = currentTable.getElementsByTagName("img");
    var imgCount = imageElements.length;
    var imagesQueue = {};
    imagesQueue[currentSightingsCount] = [];  // initialize imagesQueue for current sighting


    // Convert image URL (/public/swap/image.png) to base64 string
    function getBase64FromImageUrl(url, cb) {
        
        var image = new Image();

        image.onload = function () {
            
          var canvas = document.createElement("canvas");
          canvas.width =this.width;
          canvas.height =this.height;
          imgWidth = Math.floor(canvas.width * 0.6);  // resize for adding image to PDF
          imgHeight = Math.floor(canvas.height * 0.6);

          canvas.getContext("2d").drawImage(this, 0, 0)

          cb(canvas.toDataURL("image/png"));
        };

        image.src = url;
    }


    // Retrieve cached image in ./public/swap
    function retrieveImage(imageInfo) {

      var imageFolder = imageInfo[0].split('/')[1];
      var imageName = imageInfo[1];
      var status = $("#species_ajax_result").text();
      var swapUrl = "swap/" + imageFolder + "/" + currentSightingsCount + "/" + imageName;

      if (status === "AJAX request successfully received - image cached.") {

        // convert image to base64 string
        getBase64FromImageUrl(swapUrl, function(dataUri) {

          var base64String = dataUri;

          imagesQueue[currentSightingsCount].push([base64String, 'PNG', imgWidth, imgHeight]);
          queuedImages += 1;
          imgCount -= 1;

          if (imgCount === 0) {  // if all images have been added for the sighting

            for (var sightingsCount in imagesQueue) {

              sightingsTablesQueue[sightingsCount].push(["imagesQueue", imagesQueue[sightingsCount]]);

              if (queuedImages === totalImagesCount) {  // wait until all images are queued

                processSightingsTablesQueue(pdf);
              }
            }
          }
        });
      }
    }


    // Cache S3 folder and file names to files array
    function parseSpeciesImageUrl(imgUrl) {

      var root_dir = imgUrl.split('/')[3];  // extract S3 folder name from URL
      var sub_dir = imgUrl.split('/')[4];
      var path = root_dir + "/" + sub_dir
      var file = imgUrl.split('/').pop().split('?').shift();  // extract S3 image name from URL
      var parsedData = [path, file];

      return parsedData;
    }


    // Make AJAX request to Sinatra route to prompt caching of images to ./public/swap
    function cacheImage(imgUrl) {

      var imageInfo = parseSpeciesImageUrl(imgUrl);

      $.ajax({
          url: "/cache_image",
          type: 'POST',
          data: { image_info: imageInfo, sighting_count: currentSightingsCount, url_type: "S3" },
          success: function(result) {
            
            $("#species_ajax_result").html(result);
            retrieveImage(imageInfo);
          }
      });
    }

    // get each image's base64 string, width and height, and add to addImagesQueue array
    for (var i=0; i<imgCount; i++) {

      var imgUrl = imageElements[i].currentSrc;
      cacheImage(imgUrl);
    }
  }


  // Determine if there are any "Image Table" entries in speciesTableTypes array 
  function evalSpeciesTableTypes() {

    var imageTables = false;

    $.each(speciesTableTypes, function (index, value) {
      if (value === "Image Table") {
        imageTables = true;
      }
    });

    return imageTables;
  }


  // Queue all sightings for the current species
  function queueSightings(pdf, res, currentTable, firstTableHeader, imageTableClass) {

    if (firstTableHeader === "Location") {

      currentSightingsCount += 1;  // "Location" is the header of the first sightings table
      sightingsTablesQueue[currentSightingsCount] = [];
      sightingsTablesQueue[currentSightingsCount].push(["addLocationTable", pdf, res]);

    } else if (firstTableHeader === "Notes") {

      sightingsTablesQueue[currentSightingsCount].push(["addNotesTable", pdf, res]);

      // if this is the last sighting and there are no image tables
      if (evalSpeciesTableTypes() === false) {
        processSightingsTablesQueue(pdf);
      }

    } else {  // image table

      // calculate number of images in current sighting
      var currentSightingsImagesCount = currentTable.getElementsByTagName("img").length;

      if (currentSightingsImagesCount > 0) {  // run only if there are images in the image table
        queueImages(pdf, currentTable, currentSightingsCount);
      }
    }
  }


  // Process all of the tables for the current species
  function processTablesQueue(tablesQueue, pdf) {

    tablesQueue.each(function(index, value) {

      // get HTML data for populating PDF with tables
      var res = pdf.autoTableHtmlToJson(value);

      if (index === 0) {  // first table

        addSpeciesTable(pdf, res);

      } else {  // subsequent tables

        // set page to the same one as previous table
        pdf.setPage(1 + pdf.internal.getCurrentPageInfo().pageNumber - pdf.autoTable.previous.pageCount);
        
        var imageTableClass = value.classList.contains("img-table");  // filter th innerText and isolate image table

        if (imageTableClass !== true) {  // get first table header for non-image tables
          var firstTableHeader = value.getElementsByTagName("th")[0].innerText;
        }

        if (firstTableHeader === "Description") {

          addDescriptionTable(pdf, res);

        } else {  // queue sightings tables

          queueSightings(pdf, res, value, firstTableHeader, imageTableClass);
        }
      }

    });
  }


  // Collect all tables in species panel and collect first table header for lookahead
  function processSpeciesTables(speciesButton) {

    var speciesPanel = speciesButton.next();
    var speciesTables = speciesPanel.children("table");

    speciesTables.each (function(index, value) {
      
      speciesTableTypes.push(value.getElementsByTagName("th")[0].innerText);
    });

    return speciesTables;
  }


  // Collect all tables in visible sightings panels and collect first table header for lookahead
  function processSightingsTables(sightingsButtons) {

    var sightingsTables = [];

    $.each(sightingsButtons, function(btn_ind, btn_value) {

      var sightingsPanel = btn_value.next();
      var sightingsPanelTables = sightingsPanel.children();

      sightingsPanelTables.each(function(pan_ind, pan_val) {

        sightingsTables.push(pan_val);  // collect sightings tables
        var imageTable = pan_val.classList.contains("img-table");

        if (imageTable !== true) {

          var tableType = pan_val.getElementsByTagName("th")[0].innerText;
          speciesTableTypes.push(tableType);

        } else {

          var sightingsImagesCount = pan_val.getElementsByTagName("img").length;

          if (sightingsImagesCount > 0) {
            speciesTableTypes.push("Image Table");
          } else {
            speciesTableTypes.push("Empty Image Table");
          }
        }
      });
    });

    return sightingsTables;
  }


  // Setup up header and filename for PDF
  function generatePdfInfo(speciesButton) {

    var speciesCommon = speciesButton.getElementsByTagName("h3")[0].innerText;
    var speciesScientific = speciesButton.getElementsByTagName("h4")[0].innerText;
    var speciesHeader = speciesCommon + " - " + speciesScientific;
    pdfFilename = speciesCommon.toLowerCase() + " - " + speciesScientific.toLowerCase() + ".pdf";
    
    return speciesHeader;
  }


  // Conditionally generate a count and an array of populated image rows
  function initializeImages(sightingsButtons) {

    var imageRows = [];

    $.each(sightingsButtons, function(index, value) {  // $.each to iterate over non-jQuery arrays

      var imageRow = value.next().children().find("tr.img-row");
      var imageCount = imageRow.children().find("img").length;

      if (imageCount > 0) {
        imageRows.push(imageRow[0]);
        imageTablesCount += 1;
        totalImagesCount += imageCount;
      }
    });

    return imageRows;
  }


  // Generate an array of visible sightings buttons for the selected species
  function initializeSightings(speciesButton) {

    sightingsButtons = speciesButton.next().find("button");
    visibleSightingsButtons = [];

    sightingsButtons.each(function(index, value) {

      var sightingsButtonsDisplayStyle = $(this).css("display");  // display style for the current species button

      if (sightingsButtonsDisplayStyle === "inline-block") {  // if the species is visible, queue it for processing
        visibleSightingsButtons.push($(this));
      }
    });

    return visibleSightingsButtons;
  }


  // Initalize page header, PDF file and filename
  function setupPdf(speciesButton) {

    var speciesHeader = generatePdfInfo(speciesButton);
    var pageFormat = 'a4';
    var pdf = new jsPDF('l', 'pt', pageFormat);
    pageWidth = pdf.internal.pageSize.width;
    pageHeight = pdf.internal.pageSize.height;

    pdfHeader = function(data) {
      pdf.setFontSize(16);
      pdf.setTextColor(40);
      pdf.setFontStyle('normal');
      pdf.text(speciesHeader, data.settings.margin.left, 50);
    };

    return pdf;
  }


  // Initialize variables for the current species
  function initializeElements(speciesButton) {

    var pdf = setupPdf(speciesButton[0]);

    var sightingsButtons = initializeSightings(speciesButton);  // visible sightings buttons
    sightingsButtonsCount = sightingsButtons.length;
    totalSightingsButtons = sightingsButtonsCount;  // used to evaluate whether to call savePdf() in addImages()

    var imageRows = initializeImages(sightingsButtons); // not clear if might use this elsewhere
    var speciesTables = processSpeciesTables(speciesButton);
    var sightingsTables = processSightingsTables(sightingsButtons);
    var tablesQueue = $.merge(speciesTables, sightingsTables);

    processTablesQueue(tablesQueue, pdf);
  }

  initializeElements(speciesButton);  // fire off PDF creation functions for the current species
}


// Filter out the visible species, queue for processing and fire off createPdf() for the first species in queue
function filterVisibleElements() {

  var speciesButtons = $(".accordion_species");  // all species buttons on the page

  speciesButtons.each(function(index, value) {

    var speciesDisplayStyle = $(this).css("display");  // display style for the current species button

    if (speciesDisplayStyle === "inline-block") {  // if the species is visible, queue it for processing
      speciesQueue.push($(this));
    }
  });

  if (speciesQueue.length > 0) {

    if (outputType === "email") {
      pdfProcessing();
    }

    createPdf(speciesQueue[0]);  // grab the leading species from the queue and process

  } else {

    $("#invalid_pdf").removeClass("div_hide");
  }

  resizeReportPanels();
}


// Advise the user that the PDF is currently being processed, since it can take a minute
function pdfProcessing() {

  var i = 0;
  $("#pdf_in_progress").removeClass("div_hide");

  processingMessage = setInterval(function() {

      i = ++i % 10;
      $("#pdf_processing").html("PDF(s) processing - this may take a minute if there are numerous images.<br>."+Array(i+1).join("."));
  }, 500);

  setTimeout(function() {
    resizeReportPanels();
  }, 550);
}


// Hide PDF messaging divs
function hideMessaging() {

  $("#invalid_email_address").addClass("div_hide");
  $("#pdf_emailed").addClass("div_hide");
  $("#invalid_pdf").addClass("div_hide");

  resizeReportPanels();
}


// Stores the selected output type, then calls filterAudits()
function evalPdfOutput(output) {

  outputType = output;  // store the output type ("file" or "email")

  hideMessaging();  // hide messaging divs
  filterVisibleElements();
}


// Show email address input field and buttons
function showEmailAddress() {

  $("#pdf_email_target").removeClass("div_hide");
  $("#pdf_email_submit").removeClass("div_hide");
  $("#pdf_email_cancel").removeClass("div_hide");
  hideMessaging();
  resizeReportPanels();
}


// Hide email address input field and buttons
function hideEmailAddress() {

   $("#pdf_email_target").addClass("div_hide");
   hideMessaging();
}


// Hide invalid email address message elements
function showInvalidEmail() {

  $("#invalid_email_address").removeClass("div_hide");
  resizeReportPanels();
}


// Decrypt string
function decryptString(encryptedString) {

    return encryptedString.replace(/[A-Za-z0-9]/g, function(char) {

        return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
            "9nopqrs8tuvwxy7zabcde6fghijk5lmNOPQ4RSTUVW3XYZABC2DEFGHI1JKLM0".indexOf(char)
        );
    });
}


// Collect email address and determine if it has been validated
$("#pdf_email_form").submit(function(event) {

  event.preventDefault(); // suppress the default behavior for the form submit button

  hideMessaging();

  var obfuscatedEmails = $("#validated_addresses").text();
  var validatedEmails = [];
  targetEmail = $("#pdf_email_address").val();

  $.each(JSON.parse(obfuscatedEmails), function(index, value) {
    validatedEmails.push(decryptString(value));
  });

  if (validatedEmails.includes(targetEmail)) {

    $("#pdf_email_submit").addClass("div_hide");
    $("#pdf_email_cancel").addClass("div_hide");
    evalPdfOutput('email');

  } else {

    showInvalidEmail();
  }
});