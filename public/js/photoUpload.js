var resized_image = {};  // Object to hold resized photo file


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
    var maxW=150;  // limit the image to 150x600 maximum size
    var maxH=600;

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


// Preview, resize and encode image file
function evaluateAndResize(image) {
    var inputId = "#" + image;
    var imageSrc = image + "Image";  // update imageSrc for image preview
    var input = document.querySelector(inputId);
    var file = input.files[0];
    var fileName = file["name"].slice(0, -4) + ".png";  // image name to use with blob (resized output = PNG)

    //---- determine file signature via magic numbers ----
    getMimeType(file, evaluateMimeType);  // fire off MIME type retrieval (asynchronous)

    // Callback function called in getMimeType() to evaluate mimeType for uploaded file
    function evaluateMimeType(mimeType) {
        console.log("mimeType: " + mimeType);
        if (mimeType === "unknown") {
            alert("Invalid file type - please load a valid image file.");
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

                img = document.createElement("img");  // use resized image (blobUrl) for image preview
                img.src = blobUrl;
                document.getElementById(imageSrc).src = blobUrl;
                resized_image = {filename: fileName, data: resized};  // update object with photo filename & data
            }
        }
    }
}