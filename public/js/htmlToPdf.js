// var outputType = "";  // holds string (file, email) to trigger PDF output
// var auditQueue = [];  // holds visible audit accordions for sending to createPDF()
// var processingMessage;  // global for resetting after PDF data POSTed to Sinatra


// // Remove completed audit and start processing the next one in queue
// function trimAuditQueue() {

//   auditQueue.shift();  // remove current PDF from auditQueue

//   if (auditQueue.length > 0) {  // if there are more audits in the queue
//     createPdf(auditQueue[0]);  // process the next one
//   } else {
//     outputType = "";  // reset outputType for subsequent operations
//   }
// }


// // POST the current PDF to Sinatra via an AJAX request
// function postPdf(pdf, pdfFilename) {

//   var pdfFile = pdf.output('datauristring');  // convert PDF object to base64 string

//   $.ajax({
//     url: "/email_pdf",
//     type: 'POST',
//     data: {pdf_data: pdfFile, pdf_filename: pdfFilename},
//     success: function(data, status, xhr) {

//       $("#pdf_in_progress").addClass("hidden_field");  // hide the in progress div
//       clearTimeout(processingMessage);  // stop the setTimeout function in auditProcessing()
//       $("#pdf_emailed").removeClass("hidden_field");  // advise that email has been sent
//     }
//   });

//   trimAuditQueue();
// }


// // Save the current PDF to file, then call trimAuditQueue()
// function savePdf(pdf, pdfFilename) {

//   $("#pdf_in_progress").addClass("hidden_field");  // hide the in progress div

//   pdf.save(pdfFilename);
//   trimAuditQueue();
// }


// // Output the current PDF based on the specified output type
// function outputPdf(pdf, pdfFilename) {

//   if (outputType === "file") {

//     savePdf(pdf, pdfFilename);
  
//   } else if (outputType === "email") {

//     postPdf(pdf, pdfFilename);
//   }
// }


// // Creates jsPDF object based on tables and images in current audit
// function createPdf(auditButton) {

//   // PDF file variables
//   var pdfHeader = "";  // stored here to facilitate update/access via setupPdfFormat() and addAuditTable()
//   var pdfFilename = "";  // stored here to facilitate update/access via pdfFilename() and calls to savePdf()
//   var currentY = 0;  // used to position images and tables after images have been added

//   // Audit processing variables used to track tables for conditional processing and lookaheads
//   var auditTableTypes = [];  // used for image table lookahead in addInterventionsTable()
//   var exposureTablesQueue = {};  // container for all exposure tables and associated images
//   var exposureTablesCount = 0;  // # of exposures for current audit, conditionally savePdf() in addProgramManagementTable()
//   var totalExposureTables = 0;  // static count of exposures, conditionally savePdf() in addInterventionsTable()
//   var currentExposureCount = 0;  // used to populate exposureTablesQueue during iterations
//   var processedExposures = 0;  // conditionally call savePdf() in addInterventionsTable() and addImages()
//   var totalImagesCount = 0;  // conditionally call processExposureTablesQueue() in queueImages()
//   var queuedImages = 0;  // compared against totalImages count to conditionally call processExposureTablesQueue() in queueImages()
//   var imageTablesCount = 0;  // conditionally call savePdf() in addProgramManagementTable() and addInterventionsTable()

//   // Image placement variables
//   var pageWidth = 0;  // PDF page width used to calculate image placement
//   var pageHeight = 0;  // PDF page height used to generate new page if images will run off bottom
//   var imgStartX = 0;  // stored here to facilitate update/access while iterating in addImages()
//   var imgStartY = 0;  // stored here to facilitate update/access while iterating in addImages()
//   var imgWidth = 0;  // stored here to facilitate storing during callback in queueImages()
//   var imgHeight = 0;  // stored here to facilitate storing during callback in queueImages()


//   // Add audit table to the PDF
//   function addAuditTable(pdf, res) {
    
//     pdf.autoTable(res.columns, res.data, {
//       addPageContent: pdfHeader,
//       headerStyles: {fillColor: [44, 62, 80]},
//       margin: {
//         top: 70
//       },
//       tableWidth: 'auto',
//       columnWidth: 'auto',
//       styles: {
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { columnWidth: 'auto' },
//         1: { columnWidth: 'auto' },
//         2: { columnWidth: 'auto' },
//         3: { columnWidth: 'auto' },
//         4: { columnWidth: 'auto' },
//         5: { columnWidth: 'auto' },
//         6: { columnWidth: 'auto' },
//         7: { columnWidth: 150 }
//       }
//     });

//     auditTableTypes.shift();
//   }


//   // Add program management table to the PDF
//   function addProgramManagementTable(pdf, res) {

//     var pmTableStartY = pdf.autoTable.previous.finalY + 10;  // subsequent tables follow previous

//     pdf.autoTable(res.columns, res.data, {
//       startY: pmTableStartY,
//       headerStyles: {fillColor: [44, 62, 80]},
//       tableWidth: 'auto',
//       styles: {
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { columnWidth: 'auto' },
//         1: { columnWidth: 150 }
//       }
//     });

//     auditTableTypes.shift();

//     // if there are no exposures, save the PDF
//     if (imageTablesCount === 0 && exposureTablesCount === 0) {
//       outputPdf(pdf, pdfFilename);
//     }
//   }


//   // Add exposure table to the PDF
//   function addExposureTable(pdf, res) {

//     var expTableStartY = 0;

//     if (processedExposures === 0) {
//       expTableStartY = pdf.autoTable.previous.finalY + 10  // subsequent tables follow previous      
//     } else {
//       expTableStartY = currentY + 10;
//     }

//     pdf.autoTable(res.columns, res.data, {
//       startY: expTableStartY,
//       headerStyles: {fillColor: [44, 62, 80]},
//       tableWidth: 'auto',
//       columnWidth: 'auto',
//       styles: {
//         overflow: 'linebreak'
//       }
//     });
//   }


//   // Add interventions table to the PDF
//   function addInterventionsTable(pdf, res) {

//     var intTableStartY = pdf.autoTable.previous.finalY + 10;  // subsequent tables follow previous

//     pdf.autoTable(res.columns, res.data, {
//       startY: intTableStartY,
//       headerStyles: {fillColor: [44, 62, 80]},
//       tableWidth: 'auto',
//       styles: {
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { columnWidth: 'auto' },
//         1: { columnWidth: 150 }
//       }
//     });

//     currentY = pdf.autoTable.previous.finalY;  // store Y position after adding table

//     // if there are no images for this exposure, reduce exposureTablesCount and increment processedExposures
//     if (auditTableTypes[1] === "Empty Image Table") {
//       exposureTablesCount -= 1;
//       processedExposures += 1;
//     }

//     // if there are no images for the exposure and this is the final exposure, save the PDF
//     if (processedExposures === totalExposureTables && imageTablesCount === 0) {
//       outputPdf(pdf, pdfFilename);
//     }
//   }


//   // Create an array for each row of images
//   function calculateRows(imgQ) {

//     var imgRowSets = [];
//     var currentRow = [];
//     var rowWidth = 80;  // margins on left and right sides of page

//     for (var i=0; i<imgQ.length; i++) {

//       currentImgWidth = imgQ[i][2];

//       if (rowWidth + currentImgWidth < pageWidth) {

//         rowWidth += currentImgWidth + 20;
//         currentRow.push(imgQ[i]);

//       } else {  // start a new row if the image will run off the right side of the page

//         imgRowSets.push(currentRow);
//         currentRow = [];
//         rowWidth = currentImgWidth + 100;  // margins and space between next picture
//         currentRow.push(imgQ[i]);
//       }
//     }

//     imgRowSets.push(currentRow);  // push the final currentRow into imgRowSets

//     return imgRowSets;
//   }


//   // Create an array of image heights for each row
//   function collectRowHeights(imgRowSets) {

//     var rowHeights = [];
//     var maxRowHeights = [];

//     for (var i=0; i<imgRowSets.length; i++) {

//       var currentRowHeights = [];

//       for (var j=0; j<imgRowSets[i].length; j++) {
//         currentRowHeights.push(imgRowSets[i][j][3]);
//       }

//       rowHeights.push(currentRowHeights);
//       currentRowHeights = [];
//     }

//     return rowHeights;
//   }


//   // Create an array of maximum image heights for each row
//   function calculateMaxRowHeights(rowHeights) {

//     maxRowHeights = [];

//     for (var i=0; i<rowHeights.length; i++) {

//       var maxHeight = rowHeights[i].reduce(function(a, b) { return Math.max(a, b); });

//       maxRowHeights.push(maxHeight);
//     }

//     return maxRowHeights;
//   }


//   // Calculate leading margin so images appear centered
//   function calculateMargin(imgRowSet) {

//     rowWidth = -20;  // offset for final image margin

//     for (var i=0; i<imgRowSet.length; i++) {
//       rowWidth += imgRowSet[i][2] + 20;
//     }

//     return (pageWidth - rowWidth) / 2;
//   }


//   // Add images to the PDF
//   function addImages(pdf, imgQ) {

//     var imgRowSets = calculateRows(imgQ);
//     var rowHeights = collectRowHeights(imgRowSets);
//     var maxRowHeights = calculateMaxRowHeights(rowHeights);
//     imgStartY = currentY + 10;

//     for (var i=0; i<imgRowSets.length; i++) {

//       var currentRow = imgRowSets[i];

//       if (imgStartY + maxRowHeights[i] + 10 > pageHeight) {  // determine if images go off page
//         pdf.addPage();
//         imgStartY = 40;
//       }

//       imgStartX = calculateMargin(imgRowSets[i]);  // recalculate to center images

//       for (var j=0; j<currentRow.length; j++) {  // add images for the current row to the PDF

//         var pdfImgBase64 = currentRow[j][0];
//         var pdfImgType = currentRow[j][1];
//         var imgWidth = currentRow[j][2];
//         var imgHeight = currentRow[j][3];

//         pdf.addImage(pdfImgBase64, pdfImgType, imgStartX, imgStartY, imgWidth, imgHeight);
//         imgStartX += imgWidth + 20;
//       }

//       imgStartY += maxRowHeights[i] + 10;
//     }

//     imageTablesCount -= 1;  // decrement the number of image tables in audit
//     processedExposures += 1;
//     currentY = imgStartY;  // update currentY for exposure table positioning

//     if (processedExposures === totalExposureTables) {
//       outputPdf(pdf, pdfFilename);
//     }
//   }


//   // Process exposure table, interventions table and images in exposureTablesQueue array
//   function processExposureTablesQueue(pdf) {

//     for (var expCount in exposureTablesQueue) {

//       while (exposureTablesQueue[expCount]) {

//         if (exposureTablesQueue[expCount][0][0] === "addExposureTable") {

//           addExposureTable(exposureTablesQueue[expCount][0][1], exposureTablesQueue[expCount][0][2]);
//           auditTableTypes.shift();
//           exposureTablesQueue[expCount].shift();

//         } else if (exposureTablesQueue[expCount][0][0] === "addInterventionsTable") {

//           addInterventionsTable(exposureTablesQueue[expCount][0][1], exposureTablesQueue[expCount][0][2]);
//           auditTableTypes.shift();

//           // remove "Empty Image Table" item from beginning of auditTableTypes if present
//           if (auditTableTypes[0] === "Empty Image Table") {
//             auditTableTypes.shift();
//           }

//           exposureTablesQueue[expCount].shift();

//         } else if (exposureTablesQueue[expCount][0][0] === "imagesQueue") {

//           addImages(pdf, exposureTablesQueue[expCount][0][1]);
//           auditTableTypes.shift();
//           exposureTablesQueue[expCount].shift();
//         }

//         // remove exposureTablesQueue property after all arrays have been processed
//         if (exposureTablesQueue[expCount].length === 0) {
//           delete exposureTablesQueue[expCount];
//         }
//       }
//     }
//   }


//   // Queue images for the PDF
//   function queueImages(pdf, currentTable, currentExposureCount) {

//     var imageElements = currentTable.getElementsByTagName("img");
//     var imgCount = imageElements.length;
//     var imagesQueue = {};
//     imagesQueue[currentExposureCount] = [];  // initialize imagesQueue for current exposure


//     // Sends AJAX request to remove exposure image directories from ./public/swap
//     function cleanupSwap() {

//       $.ajax({
//           url: "/purge_images",
//           type: 'POST',
//           data: { purge_images: "yes" },  // not used, just a trigger
//           success: function(result) {}
//       });
//     }


//     // Convert image URL (/public/swap/image.png) to base64 string
//     function getBase64FromImageUrl(url, cb) {
        
//         var image = new Image();

//         image.onload = function () {
            
//           var canvas = document.createElement("canvas");
//           canvas.width =this.width;
//           canvas.height =this.height;
//           imgWidth = Math.floor(canvas.width * 0.6);  // resize for adding image to PDF
//           imgHeight = Math.floor(canvas.height * 0.6);

//           canvas.getContext("2d").drawImage(this, 0, 0)

//           cb(canvas.toDataURL("image/png"));
//         };

//         image.src = url;
//     }


//     // Retrieve cached image in ./public/swap
//     function retrieveImage(imageInfo) {

//       var imageName = imageInfo[1];
//       var status = $("#ajax_result").text();
//       var swapUrl = "swap/" + currentExposureCount + "/" + imageName;

//       if (status === "AJAX request successfully received - image cached.") {

//         // convert image to base64 string
//         getBase64FromImageUrl(swapUrl, function(dataUri) {

//           var base64String = dataUri;

//           imagesQueue[currentExposureCount].push([base64String, 'PNG', imgWidth, imgHeight]);
//           queuedImages += 1;
//           imgCount -= 1;

//           if (imgCount === 0) {  // if all images have been added for the exposure

//             for (var exposureCount in imagesQueue) {

//               exposureTablesQueue[exposureCount].push(["imagesQueue", imagesQueue[exposureCount]]);

//               if (queuedImages === totalImagesCount) {  // wait until all images are queued

//                 processExposureTablesQueue(pdf);
//                 cleanupSwap();  // purge cached exposure directories from ./public/swap
//               }
//             }
//           }
//         });
//       }
//     }


//     // Cache S3 folder and file names to files array
//     function parseImageUrl(imgUrl) {

//       var folder = imgUrl.split('/')[3];  // extract S3 folder name from URL
//       var file = imgUrl.split('/').pop().split('?').shift();  // extract S3 image name from URL
//       var parsedData = [folder, file];

//       return parsedData;
//     }


//     // Make AJAX request to Sinatra route to prompt caching of images to ./public/swap
//     function cacheImage(imgUrl) {

//       var imageInfo = parseImageUrl(imgUrl);

//       $.ajax({
//           url: "/cache_image",
//           type: 'POST',
//           data: { image_info: imageInfo, exposure_count: currentExposureCount },
//           success: function(result) {
            
//             $("#ajax_result").html(result);
//             retrieveImage(imageInfo);
//           }
//       });
//     }

//     // get each image's base64 string, width and height, and add to addImagesQueue array
//     for (var i=0; i<imgCount; i++) {

//       var imgUrl = imageElements[i].currentSrc;
//       cacheImage(imgUrl);
//     }
//   }


//   // Determine if there are any "Image Table" entries in auditTableTypes array 
//   function evalAuditTableTypes() {

//     var imageTables = false;

//     for (var i=0; i<auditTableTypes.length; i++) {

//       if (auditTableTypes[i] === "Image Table") {
//         imageTables = true;
//       }
//     }

//     return imageTables;
//   }


//   // Queue all exposures for the current audit
//   function queueExposure(pdf, res, currentTable, firstTableHeader, imageTableClass) {

//     if (firstTableHeader === "Audit Number") {

//       currentExposureCount += 1;  // "Audit Number" is the header of the first exposure table
//       exposureTablesQueue[currentExposureCount] = [];
//       exposureTablesQueue[currentExposureCount].push(["addExposureTable", pdf, res]);

//     } else if (firstTableHeader === "Interventions") {
      
//       if (imageTableClass !== true) {

//         exposureTablesQueue[currentExposureCount].push(["addInterventionsTable", pdf, res]);

//         // if this is the last exposure and there are no image tables
//         if (evalAuditTableTypes() === false) {
//           processExposureTablesQueue(pdf);
//         }

//       } else {  // image table

//         // calculate number of images in current exposure
//         var currentExposureImagesCount = currentTable.getElementsByTagName("img").length;

//         if (currentExposureImagesCount > 0) {  // run only if there are images in the image table
//           queueImages(pdf, currentTable, currentExposureCount);
//         }
//       }
//     }
//   }


//   // Process all of the tables in the current audit
//   function processAuditTables(auditTables, pdf) {

//     for (var i=0; i<auditTables.length; i++) {

//       // get HTML data for populating PDF with tables
//       var res = pdf.autoTableHtmlToJson(auditTables[i]);

//       if (i === 0) {  // first table

//         addAuditTable(pdf, res);

//       } else {  // subsequent tables

//         // set page to the same one as previous table
//         pdf.setPage(1 + pdf.internal.getCurrentPageInfo().pageNumber - pdf.autoTable.previous.pageCount);
        
//         var imageTableClass = auditTables[i].classList.contains("img-table");  // filter th innerText and isolate image table

//         if (imageTableClass !== true) {  // get first table header for non-image tables
//           var firstTableHeader = auditTables[i].getElementsByTagName("th")[0].innerText;
//         }

//         if (firstTableHeader === "Program Management") {

//           addProgramManagementTable(pdf, res);

//         } else {  // queue exposure tables

//           queueExposure(pdf, res, auditTables[i], firstTableHeader, imageTableClass);
//         }
//       }
//     }
//   }


//   // Populate auditTableTypes array for tracking populated image rows (lookaheads)
//   function populateAuditTableTypes(auditTables) {

//     for (var i=0; i<auditTables.length; i++) {
      
//       // filter th innerText and isolate image table
//       var imageTable = auditTables[i].classList.contains("img-table");

//       if (imageTable !== true) {

//         var tableType = auditTables[i].getElementsByTagName("th")[0].innerText;
//         auditTableTypes.push(tableType);

//       } else {

//         var exposureImagesCount = auditTables[i].getElementsByTagName("img").length;

//         if (exposureImagesCount > 0) {
//           auditTableTypes.push("Image Table");
//         } else {
//           auditTableTypes.push("Empty Image Table");
//         }
//       }
//     }
//   }


//   // Setup up header and filename for PDF
//   function generatePdfInfo(auditButton) {

//     var auditName = auditButton.getElementsByTagName("h3")[0].innerText;
//     var auditDate = auditButton.getElementsByTagName("h4")[0].innerText;
//     var auditTimeRaw = auditButton.getElementsByTagName("h4")[1].innerText;
//     var auditTime = auditTimeRaw.replace(/:/g, "-");
//     var auditCompany = auditButton.getElementsByTagName("h4")[2].innerText;
//     var auditHeader = auditName + " " + auditDate + " " + auditTime + " " + auditCompany;
//     pdfFilename = auditName.toLowerCase() + "_" + auditDate + "_" + auditTime + "_" + auditCompany.toLowerCase() + ".pdf";
    
//     return auditHeader;
//   }


//   // InitalizeSet up PDF file, header and filename
//   function setupPdf(auditButton) {

//     var auditHeader = generatePdfInfo(auditButton);
//     var pageFormat = 'a4';
//     var pdf = new jsPDF('l', 'pt', pageFormat);
//     pageWidth = pdf.internal.pageSize.width;
//     pageHeight = pdf.internal.pageSize.height;

//     pdfHeader = function(data) {
//       pdf.setFontSize(12);
//       pdf.setTextColor(40);
//       pdf.setFontStyle('normal');
//       pdf.text(auditHeader, data.settings.margin.left, 50);
//     };

//     return pdf;
//   }


//   // Initialize variables for the current audit
//   function initializeAudit(auditButton) {

//     var pdf = setupPdf(auditButton[0]);
//     var auditTables = auditButton.next().find("table.table");
//     var imageRows = auditButton.next().find("button").next().children().find("tr.img-row");
//     exposureTablesCount = auditButton.next().find("button").length;
//     totalExposureTables = exposureTablesCount;  // used to evaluate whether to call savePdf() in addImages()
//     totalImagesCount = auditButton.next().find("img").length;  // calculate total number of images for current audit

//     for (var i=0; i < imageRows.length; i++) {  // calculate number of image tables for current audit
//       if (imageRows[i].childNodes[1]) { imageTablesCount += 1; }
//     }

//     populateAuditTableTypes(auditTables);
//     processAuditTables(auditTables, pdf);
//   }

//   initializeAudit(auditButton);  // fire off PDF creation functions for the current audit
// }


// // Filter out the visible audits, queue for processing and fire off createPdf() for the first audit in queue
// function filterAudits() {

//   var auditButtons = $(".accordion_audit");  // all audit buttons on the page

//   auditButtons.each (function(index, value) {

//     var auditDisplayStyle = $(this).css("display");  // display style for the current audit button

//     if (auditDisplayStyle === "inline-block") {  // if the audit is visible, queue it for processing
//       auditQueue.push($(this));
//     }
//   });

//   if (auditQueue.length > 0) {

//     createPdf(auditQueue[0]);  // grab the leading audit from the queue and process

//   } else {

//     $("#invalid_pdf").removeClass("hidden_field");
//   }
// }


// // Advise the user that the audit is currently being processed, since it can take a minute
// function auditProcessing() {

//   $("#pdf_in_progress").removeClass("hidden_field");
//   var i = 0;

//   processingMessage = setInterval(function() {

//       i = ++i % 10;
//       $("#audit_processing").html("PDF processing - this may take a minute if there are numerous images.<br>."+Array(i+1).join("."));
//   }, 500);
// }


// // Hide messaging divs - called by applyFilters(), resetFilters() and evalPdfOutput()
// function hideMessaging() {

//   $("#pdf_emailed").addClass("hidden_field");
//   $("#invalid_pdf").addClass("hidden_field");
// }


// // Stores the selected output type, then calls filterAudits()
// function evalPdfOutput(output) {

//   hideMessaging();  // hide messaging divs

//   if (output === "email") {
//     auditProcessing();
//   }

//   outputType = output;  // store the output type ("file" or "email")

//   filterAudits();
// }