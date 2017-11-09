var b64awsS3images = $("#b64_s3_images");
var b64uploadImage = $("#b64_upload_image");
var b64photoPreview = $("#b64_photo_preview");
var b64imageUrl = $("#b64_image_url");
var b64invalidImageUrl = $("#b64_invalid_image_url");
var b64imageUrlInput = $("#b64_img_url_input");
var b64textArea = $("#b64_string");
var b64progress = $("#b64_progress");
var b64copyStringBtn = $("#btn_copy_b64_string");
var imageTarget = $("#b64_photo_dest");
var b64string = $("#b64_string_src");
var btnConvert = $("#convert_b64_string");
var btnReset = $("#reset_b64_string");
var msgEmpty = $("#b64_empty_b64_string");
var msgInvalid = $("#b64_invalid_b64_string");
var exampleString;


// Resize panel height for base64 prototype
function adjustPanel(target) {

  panelResize(target);
  doScrolling("#" + target, 800);
}


// Reset elements when button options are selected
function resetB64Elements() {

  b64photoPreview.removeClass("border");
  b64photoPreview.attr("src", "");
  b64invalidImageUrl.addClass("div_hide");
  b64imageUrlInput.val("");
  b64copyStringBtn.addClass("div_hide");
  b64textArea.text("");
  b64textArea.attr("placeholder", "Image base64 string...");
}


// Show div for AWS S3 images and hide others
function b64showS3Images() {

  b64uploadImage.addClass("div_hide");
  b64imageUrl.addClass("div_hide");
  b64awsS3images.removeClass("div_hide");

  resetB64Elements();
  adjustPanel("acc_base64");
}


// Show div for image upload input and hide others
function b64showUploadImage() {

  b64awsS3images.addClass("div_hide");
  b64imageUrl.addClass("div_hide");
  b64uploadImage.removeClass("div_hide");

  resetB64Elements();
  adjustPanel("acc_base64");
}


// Show div for image URL input and hide others
function b64showImageUrl() {

  b64awsS3images.addClass("div_hide");
  b64uploadImage.addClass("div_hide");
  b64imageUrl.removeClass("div_hide");

  resetB64Elements();
  adjustPanel("acc_base64");
}


// Copy contents of base64 string textarea field to system clipboard
function copyBase64String() {

  new Clipboard("#copy_b64_string");
}


// Display base64 string in textarea field and button to copy string
function updateBase64TextArea(base64String) {

  b64progress.fadeTo(300, 0);
  b64textArea.text(base64String);
  b64copyStringBtn.removeClass("div_hide");
  panelResize("acc_base64");
  b64progress.html("");
}


// Send AJAX request to remove image from ./public/swap
function cleanupSwap(imageName) {

  $.ajax({
      url: "/purge_image",
      type: 'POST',
      data: { image_name: imageName },
      success: function(result) {
        
        console.log("result: ", result);
        $("#ajax_result").html(result);
        
        var status = $("#ajax_result").text();

        if (status === "AJAX request successfully received - image purged.") {

          console.log("Image successfully purged from ./public/swap");
        }
      }
  });
}


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

  var imageName = imageInfo[1];
  var status = $("#ajax_result").text();
  var image = "swap/" + imageName;

  if (status === "AJAX request successfully received - image cached.") {

    // convert image to base64 string
    getBase64FromImageUrl(image, function(dataUri) {

      var base64String = dataUri;

      updateBase64TextArea(base64String);
      cleanupSwap(imageName);
    });
  }
}


// Cache S3 folder and file names to files array
function parseImageUrl(imgUrl) {

  var folder = imgUrl.split('/')[3];  // extract S3 folder name from URL
  var file = imgUrl.split('/').pop().split('?').shift();  // extract S3 image name from URL
  var parsedData = [folder, file];

  return parsedData;
}


// Display Font Awesome spinner in base64 textarea while processing image
function b64InProgress() {

  b64progress.html('<i class="fa fa-refresh fa-3x fa-spin" style="color: #000;"></i>');
  b64progress.fadeTo(300, 1);
}


// Make AJAX request to Sinatra route to prompt caching of S3 image to ./public/swap
function cacheS3Image(imgUrl) {

  b64InProgress();
  var imageInfo = parseImageUrl(imgUrl);

  $.ajax({
      url: "/cache_image",
      type: 'POST',
      data: { image_info: imageInfo, url_type: "S3" },
      success: function(result) {
        
        $("#ajax_result").html(result);
        retrieveImage(imageInfo);
      }
  });
}


// Verify URL is a valid image URL before downloading
function testImageUrl(url, callback, timeout) {

  timeout = timeout || 5000;
  var timedOut = false, timer;
  var img = new Image();

  img.onerror = img.onabort = function() {

    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "error");
    }
  };

  img.onload = function() {

    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "success");
    }
  };

  img.src = url;

  timer = setTimeout(function() {

    timedOut = true;
    callback(url, "timeout");
  }, timeout); 
}


// Advise on problem with image URL
function handleBadUrl() {

  b64invalidImageUrl.removeClass("div_hide");
  updateBase64TextArea("");
  b64copyStringBtn.addClass("div_hide");
}


// Make AJAX request to Sinatra route to prompt caching of non-S3 image to ./public/swap
function convertImageUrl() {

  b64invalidImageUrl.addClass("div_hide");
  b64InProgress();

  var imageInfo = b64imageUrlInput.val();

  if (imageInfo.startsWith("http://") || imageInfo.startsWith("https://")) {
    testImageUrl(imageInfo, getTestResult);
  } else {
    handleBadUrl();
  }

  function getTestResult(url, result) {

    if (result === "success") {

      $.ajax({
        url: "/cache_image",
        type: 'POST',
        data: { image_info: imageInfo, url_type: "non-S3" },
        success: function(result) {
          
          $("#ajax_result").html(result);
          retrieveImage(["", "temp.png"]);
        }
      });

    } else {

      handleBadUrl();
    }
  }
}


// Preview, resize and encode image file
function evaluateB64AndResize(image) {

  $('#b64_photo_preview').removeClass('div_hide');

  var inputId = '#' + image;
  var imageSrc = image + '_preview';  // update imageSrc for image preview
  var input = document.querySelector(inputId);
  var file = input.files[0];
  var fileName = file['name'].slice(0, -4) + '.png';  // image name to use with blob (resized output = PNG)

  //---- determine file signature via magic numbers ----
  getMimeType(file, evaluateMimeType);  // fire off MIME type retrieval (asynchronous)

  // Callback function called in getMimeType() to evaluate mimeType for uploaded file
  function evaluateMimeType(mimeType) {
    console.log('mimeType: ' + mimeType);
    if (mimeType === 'unknown') {

      alert('Invalid file type - please load a valid image file.');

    } else {

      url = URL.createObjectURL(file);  // create Object URL for resizing photo
      resizeImage(url, getBase64String);  // fire off base64-encoded image string retrieval (asynchronous)

      // Callback function called in resizeImage() to get resized base64-encoded image string and output to div
      function getBase64String(resized) {

        var stringDataTypeFull = resized.split(';')[0];
        var stringDataType = stringDataTypeFull.split(':')[1];  // get data type for blob conversion
        var stringBase64 = resized.split(',')[1];  // get base64 string for blob conversion - iVBORw0KGgoAAAA...
        var blob = b64toBlob(stringBase64, stringDataType);  // encode base64 string as blob for preview & file ops
        var blobUrl = URL.createObjectURL(blob);  // create Object URL for image preview of resized image

        img = document.createElement('img');  // use resized image (blobUrl) for image preview
        img.src = blobUrl;
        document.getElementById(imageSrc).src = blobUrl;
        b64photoPreview.addClass("border");
        
        // resize panel after image loaded (delay)
        stUploadImage = setTimeout( function(){
          
          adjustPanel("acc_base64");
          b64InProgress();

          // update base64 text area after a delay (smoother)
          stUpdateTextArea = setTimeout( function() {

            updateBase64TextArea(resized);
            clearTimeout(stUpdateTextArea);
          }, 500);

          clearTimeout(stUploadImage);
        }, 100);
      }
    }
  }
}


// Clear loaded base64 string and image
function resetBase64String() {

  imageTarget.attr("src", "");
  imageTarget.removeClass("border");
  btnReset.addClass("div_hide");
  btnConvert.removeClass("div_hide");
  b64string.val("");
}


// Hide any visible empty/invalid base64 string messages
function clearBase64Messages() {

  msgEmpty.addClass("div_hide");
  msgInvalid.addClass("div_hide");
}


// Load base64 string into img element to preview image
function loadBase64Image() {

  var b64stringText = b64string.val();
  var png = "data:image/png;base64";
  var jpg = "data:image/jpeg;base64";
  var gif = "data:image/gif;base64";

  clearBase64Messages();

  if (b64stringText !== "") {

    if (b64stringText.startsWith(png) || b64stringText.startsWith(jpg) || b64stringText.startsWith(gif)) {

      imageTarget.attr("src", b64string.val());
      imageTarget.addClass("border");
      imageTarget.removeClass("div_hide");
      btnConvert.addClass("div_hide");
      btnReset.removeClass("div_hide");

      stLoadImage = setTimeout( function(){
        
        adjustPanel("acc_base64conv");
        clearTimeout(stLoadImage);
      }, 100);

    } else {

      msgInvalid.removeClass("div_hide");
      adjustPanel("acc_base64conv");

    }
  } else {

    msgEmpty.removeClass("div_hide");
    adjustPanel("acc_base64conv");
  }
}


// Copy contents of /public/misc/example_b64.txt into text area
function loadExampleString() {

  resetBase64String();
  clearBase64Messages();
  b64string.val("");

  if (exampleString === undefined) {

    jQuery.get("misc/example_b64.txt", function(data) {
      
      exampleString = data;
      b64string.val(exampleString);
    });

  } else {

    b64string.val(exampleString);    
  }

  // same result but shorter - reloads each time
  // $("#b64_string_src").load("misc/example_b64.txt");
}