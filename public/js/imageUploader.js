var resizedImages = [];  // array to hold resized photo files - used by evaluateAndResize()
var photoCounter = 1;  // counter for multiple images - used by evaluateAndResize()
var uploadBtnClasses = document.getElementById('btn_upload_photos').classList;  // called multiple places
var deletePhotos = [];  // array to hold names of uploaded photos marked for deletion

// Compare uploaded image file signature against known MIME types
// Add more from:  http://en.wikipedia.org/wiki/List_of_file_signatures
function evaluateFileSignature(headerString) {

    switch (headerString) {
        case "89504e47":
            type = "image/png";
            break;
        case "47494638":
            type = "image/gif";
            break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
            type = "image/jpeg";
            break;
        default:
            type = "unknown";
            break;
    }

    return type;
}


// Instantiate fileReader object, collect file signature and retrieve MIME type
function getMimeType(file, callback) {

    var fileReader = new FileReader();  // instantiate new FileReader object

    fileReader.onloadend = function(e) {  // after file is loaded...
        var arr = (new Uint8Array(e.target.result)).subarray(0, 4);  // get file signature
        var header = "";  // tranlsate file signature from decimal to hex for easier comparison
        for(var i = 0; i < arr.length; i++) { header += arr[i].toString(16); }
        var mimeType = evaluateFileSignature(header);
        callback(mimeType);  // retrieve mimeType for evaluation via evaluateMimeType()
    };

    fileReader.readAsArrayBuffer(file);  // asynchronous function call
}


// Output uploaded image as a resized (semi) base64-encoded image string
function resizeImage(url, callback) {

    var img = new Image;
    var canvas = document.createElement("canvas");
    var ctx=canvas.getContext("2d");
    var cw=canvas.width;
    var ch=canvas.height;
    var maxW=250;  // limit the image to 250x250 maximum size
    var maxH=750;

    img.onload = function() {
        var iw=img.width;
        var ih=img.height;
        var scale=Math.min((maxW/iw),(maxH/ih));
        var iwScaled=iw*scale;
        var ihScaled=ih*scale;
        canvas.width=iwScaled;
        canvas.height=ihScaled;
        ctx.drawImage(img,0,0,iwScaled,ihScaled);
        resized = canvas.toDataURL();  // converted image as base64-encoded string
        callback(resized);
  }

    img.src = url
}


// Convert base64 string to blob for image preview & file operations
function b64toBlob(b64Data, contentType, sliceSize) {

    var contentType = contentType || '';
    var sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}


// Delete photo <td> element and corresponding object from resizedImages array
function deletePhoto(td) {

    // remove <td> element from table row
    var row = document.getElementById("more-photos");

    for (var i = 0; i < row.children.length; i++) {
        if (row.children[i] === td) { row.deleteCell(i); }
    }

    // remove photo from resizedImages array
    var selectedPhoto = td.children[0].id;

    for (var j = 0; j < resizedImages.length; j++ ) {
        if (resizedImages[j].filename === selectedPhoto) { delete resizedImages[j]; }
    }

    // filter undefined element from array if photo element deleted
    resizedImages = resizedImages.filter(function(k) { return k != undefined }); 

    // hide Upload button and remove message if last photo element deleted
    if ($("#photo_table tr td").length === 0) {

        uploadBtnClasses.add('btnHide');
        document.getElementById('hide_upload_status').style.display = "none";
    }
}


// Adjust div size after image file loads - line 170: onload="resizeDiv()"
function resizeDiv() {

    var panel = document.getElementById("imgUploaderPanel");
    panel.style.maxHeight = panel.scrollHeight + "px";  // recalculate height
}


// Validate, resize, encode and preview image file
function evaluateAndResize(file) {

    var fileName = file["name"].slice(0, -4) + ".png";  // image name to use with blob (resized output = PNG)

    // determine file signature via magic numbers
    getMimeType(file, evaluateMimeType);  // fire off MIME type retrieval (asynchronous)

    // callback function called in getMimeType() to evaluate mimeType for uploaded file
    function evaluateMimeType(mimeType) {
        
        if (mimeType === "unknown") {
            alert("Invalid file type - please load a valid image file.");
        } else {

            url = URL.createObjectURL(file);  // create Object URL for resizing photo
            resizeImage(url, getBase64StringMulti);  // fire off base64-encoded image string retrieval (asynchronous)

            // callback function called in resizeImage() to get resized base64-encoded image string and output to div
            function getBase64StringMulti(resized) {

                var stringDataTypeFull = resized.split(';')[0];
                var stringDataType = stringDataTypeFull.split(':')[1];  // get data type for blob conversion
                var stringBase64 = resized.split(',')[1];  // get base64 string for blob conversion - iVBORw0KGgoAAAA...
                var blob = b64toBlob(stringBase64, stringDataType);  // encode base64 string as blob for preview & file ops
                var blobUrl = URL.createObjectURL(blob);  // create Object URL for image preview of resized image

                img = document.createElement("img");  // use resized image (blobUrl) for image preview
                img.src = blobUrl;
                document.getElementById(fileName).src = blobUrl;

                resizedImages.push({filename: fileName, data: resized});  // push photo filename & data to array
            }
        }
    }

    var imgRowDiv = document.getElementById("more-photos");

    // append img to more-photos td element if not already added (line 18 in photo_upload.erb)
    if (!imgRowDiv.innerHTML.includes(fileName)) {
        imgRowDiv.innerHTML += '<td class="img-container" onclick="deletePhoto(this)">\
                                    <img img src="" class="target-img" id=' + fileName + ' onload="resizeDiv()">\
                                    <div class="overlay">\
                                        <div class="nonEditorButton">Remove</div>\
                                    </div>\
                                </td>';
    }

    // show Upload button and display message
    if ($("#photo_table tr td").length > 0) {

        uploadBtnClasses.remove('btnHide');
        document.getElementById('hide_upload_status').style.display = "inline";
        $("#upload_status").text("Select a photo to remove it from the list.").show();
    }

    photoCounter += 1;
}


// Iterate through photos object and pass each photo to evaluateAndResize()
function processFileList() {

    var input = document.querySelector("#photos");
    var files = input.files;

    for (i = 0; i < files.length; i++) {
        evaluateAndResize(files[i]);
    }
}


// POST filename and data for all photos in resizedImages array when Upload button is clicked
$("#btn_upload_photos").on("click", function() {

    var width = 0;  // initialize width of progress bar (outside progress_bar() so persistent)
    var progress = 0;  // initialize progress (% of photos uploaded)


    // remove "Select a photo..." message
    if ($("#upload_status").text() === "Select a photo to remove it from the list.") {
        document.getElementById('hide_upload_status').style.display = "none";
    }


    // Message if Upload button is clicked and no photos were selected
    if (resizedImages.length === 0) { 
        document.getElementById('hide_upload_status').style.display = "inline";
        $("#upload_status").text("You didn't upload any photos - please try again.").show();
    }


    // Changes after uploads have completed
    function uploadStatus(length) {

        if (length > 0) {
            document.getElementById('hide_upload_status').style.display = "inline";

            // find all img elements in more-photos tr and remove target-img class
            var img = $("#more-photos").find("img");
            img.removeClass("target-img");
            img.addClass("uploaded-img");

            // remove onclick function and overlay divs
            var cells = $("#more-photos").find("td");          

            for (var i = 0; i < cells.length; i++) {
                cells[i].onclick = null;
                cells[i].removeChild(cells[i].childNodes[3]);
            }

            // message with photo upload status
            $("#upload_status").html("Your photos have successfully uploaded.<br>Please note that it will take a moment to process them.").show();
            updateButtons();
        }
    }


    // POST the photo name and data to /queue_photos route via an AJAX request
    function queuePhotos(file, index, length) {
        $.ajax({
            url: "/queue_photos",
            type: 'POST',
            data: {filename: file.filename, data: file.data},
            success: function(data, status, xhr) {},
            complete: function(data, status, xhr) {
                if (index + 1 === length) {  // if this is the last photo
                    uploadPhotos();
                }
            }
        });
    }


    // Trigger /upload_photos route to start processing photo data from photo queue
    function uploadPhotos() {
        $.ajax({
            url: "/upload_photos",
            type: 'POST',
            data: {photoUploadStatus: "OK"},
            success: function(data, status, xhr) {}
        });
    }


    // Incrementally draw a progress bar based on photo upload completion
    function photoProgressBar(progress, length) {

        var elem = document.getElementById("photo_progress");
        var speed = 20 * length;  // integer determines speed of progress bar draw
        var id = setInterval(frame, speed);

        function frame() {

            if (width >= progress) {
                clearInterval(id);
            } else {
                width++;
                elem.style.width = width + '%';
                elem.innerHTML = width * 1  + '%';
                if (width === 100) { 
                    uploadStatus(length);  // message once all photos uploaded
                }
            }
        }
    }

    // Sets display style for photo progress bar div so it is visible
    function showPhotoProgress() {

       document.getElementById('hide_ajax_progress').style.display = "inline";
    }


    // Hide Upload button and show Upload More Photos and Return Home buttons after clicking Upload button
    function updateButtons() {

        var uploadMoreBtnClasses = document.getElementById('btn_more_photos').classList;

        if (uploadMoreBtnClasses.contains('btnHide')) {
            uploadBtnClasses.add('btnHide');
            uploadMoreBtnClasses.remove('btnHide');
        }
    }


    // Iterate through the resizedImages array and queue each photo via AJAX request
    $("#ajax_write").submit(function(event) {

        event.preventDefault();  // suppress the default behavior for the form submit button

        $.each(resizedImages, function(index, file) {

            var length = resizedImages.length;
            queuePhotos(file, index, length);  // AJAX request to queue photo
            progress =  (index + 1) * 100 / length;  // percentage of image upload completion (integer)
            showPhotoProgress();
            photoProgressBar(progress, length);
        });

        // Hide the Select Photo button after clicking Upload if there are any photos
        if ($("#photo_table tr td").length > 0) {
            document.getElementById('select_photo_button').style.display = "none";
        }

        resizedImages = [];  // flush the array
        photoCounter = 1;  // reset the counter
    });
});


// Hide "You didn't upload any photos..." message if it is showing after clicking Select Photo button
$("#photos").on("click", function() {

    var uploadMsg = document.getElementById('hide_upload_status').style.display;

    if (uploadMsg === "inline" && $("#upload_status").text() !== "Select a photo to remove it from the list.") { 
        document.getElementById('upload_status').style.display = "none";
    }
});


// Add photo to deletePhotos array when selected
function selectPhoto(td) {

    var overlayCheckbox = td.childNodes[3].childNodes[1];
    var overlayClasses = td.childNodes[3].classList;
    var delPhotosClasses = document.getElementById('btn_del_photos').classList;

    // get the photo name from the S3 URL
    imgSrc = td.childNodes[1].src;
    imgName = imgSrc.replace(/^(.*[/\\])?/, '').replace(/(\?[^.]*)$/, '')
    
    // if deletePhotos array doesn't have photo name, add it & show checkbox
    if (!deletePhotos.includes(imgName)) {
        deletePhotos.push(imgName);
        overlayCheckbox.checked = true;
        overlayClasses.remove('rmv-opacity');
        delPhotosClasses.remove('btnHide');
        resizeDiv();
    } else {  // otherwise, delete it from deletePhotos array & clear checkbox
        var index = deletePhotos.indexOf(imgName);
        if (index > -1) {
            deletePhotos.splice(index, 1);
        }
        overlayCheckbox.checked = false;
        overlayClasses.add('rmv-opacity');
        if (deletePhotos.length === 0) {
            delPhotosClasses.add('btnHide');
        }
    }
}


// POSTs the image names in deletePhotos array 
$("#btn_del_photos").on("click", function() {

    post('/deletephotos', {selected: deletePhotos});
});