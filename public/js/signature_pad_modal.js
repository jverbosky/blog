// modal elements
var signatureModal = document.getElementById('signature-modal');
var signFormBtn = document.getElementById("sign-form-btn");
var closeModalBtn = document.getElementById("close-modal-btn");

// signature pad elements
var wrapper = document.getElementById("signature-pad");
var clearButton = wrapper.querySelector("[data-action=clear]");
var undoButton = wrapper.querySelector("[data-action=undo]");
var showBase64String = wrapper.querySelector("[data-action=base64-string]");
var canvas = wrapper.querySelector("canvas");
var signaturePad = new SignaturePad(canvas);

// image and reset button elements
var appSigTrigger = document.getElementById("appSigTrigger");
var imgAppSig = document.getElementById("imgAppSig");
var imgAppSigResetDiv = document.getElementById("imgAppSigResetDiv");
var imgAppSigReset = document.getElementById("imgAppSigReset");
var baseTarget = document.getElementById('base-target');


// Open the signature modal when the Sign Form button is clicked
appSigTrigger.addEventListener("click", function(event) {
    signatureModal.style.display = "block";
    resizeCanvas(); // fire off so signature appears on canvas
});

// Close the modal when the <span> (x) is clicked
closeModalBtn.addEventListener("click", function(event) {
    signatureModal.style.display = "none";
});

// Close the modal when clicking outside of it
// - disabling for now, accidentally hitting while signing
// window.addEventListener("click", function(event) {
//     if (event.target == signatureModal) {
//         signatureModal.style.display = "none";
//     }
// });

// Clear the canvas when the Clear button is clicked
clearButton.addEventListener("click", function(event) {
    signaturePad.clear();
});

// Remove the last stroke from the canvas when the Undo button is clicked
undoButton.addEventListener("click", function(event) {

    var data = signaturePad.toData();

    if (data) {
        data.pop(); // remove the last dot or line
        signaturePad.fromData(data);
    }
});

// Close the modal and output the base 64 string to the text area field (prototype)
showBase64String.addEventListener("click", function(event) {

    if (signaturePad.isEmpty()) {
        alert("Please provide a signature first.");
    } else {

        var timestamp = new Date();
        var utcDate = timestamp.toUTCString();

        // var dataURL = signaturePad.toDataURL();  // uncropped dataURL
        var dataURL = cropSignatureCanvas(canvas);

        // paste the base64 string (dataURL) to the text area field
        baseTarget.value = dataURL;

        // display the image and reset button
        appSigTrigger.value = "(Signature Captured on " + utcDate + ")";
        imgAppSig.src = dataURL;
        imgAppSig.classList.add("signature-image-visible");
        imgAppSigResetDiv.classList.add("signature-image-reset-visible");

        // close the modal
        signatureModal.style.display = "none";

        // resize accordion panel (setTimeout to give modal a chance to close)
        setTimeout(function() {
            panelResize("acc_sig_pad");
            doScrolling("#acc_sig_pad", 800);
        }, 0);
    }
});

// Clear the image and base64 string from all corresponding fields when Applicant 1 Signature Reset button selected
imgAppSigReset.addEventListener("click", function(event) {

    appSigTrigger.value = "";
    imgAppSig.src = "";
    imgAppSig.classList.remove("signature-image-visible");
    imgAppSigResetDiv.classList.remove("signature-image-reset-visible");

    // text area
    baseTarget.value = "";

    // resize accordion panel
    panelResize("acc_sig_pad");
});

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio = Math.max(window.devicePixelRatio || 1, 1);

    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    // This library does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    signaturePad.clear();
}

// On mobile devices it might make more sense to listen to orientation change,
// rather than window resize events.
window.onresize = resizeCanvas;
resizeCanvas();

// One could simply use Canvas#toBlob method instead, but it's just to show
// that it can be done using result of SignaturePad#toDataURL.
function dataURLToBlob(dataURL) {
    // Code taken from https://github.com/ebidel/filer.js
    var parts = dataURL.split(';base64,');
    var contentType = parts[0].split(":")[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

// per: https://github.com/szimek/signature_pad/issues/49#issuecomment-260976909
function cropSignatureCanvas(canvas) {

    // First duplicate the canvas to not alter the original
    var croppedCanvas = document.createElement('canvas'),
        croppedCtx = croppedCanvas.getContext('2d');

    croppedCanvas.width = canvas.width;
    croppedCanvas.height = canvas.height;
    croppedCtx.drawImage(canvas, 0, 0);

    // Next do the actual cropping
    var w = croppedCanvas.width,
        h = croppedCanvas.height,
        pix = { x: [], y: [] },
        imageData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height),
        x, y, index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index + 3] > 0) {
                pix.x.push(x);
                pix.y.push(y);
            }
        }
    }
    pix.x.sort(function(a, b) { return a - b });
    pix.y.sort(function(a, b) { return a - b });
    var n = pix.x.length - 1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);

    croppedCanvas.width = w;
    croppedCanvas.height = h;
    croppedCtx.putImageData(cut, 0, 0);

    return croppedCanvas.toDataURL();
}