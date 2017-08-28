// Sets display style for feedback div so it is visible
function showFeedback() {

    var feedbackBox = document.getElementById('feedbackBox');
    var feedbackText = feedbackBox.childNodes[1].innerText.trim();
    var addError = 'Invalid animal path specified:';
    var delError = 'Animal path not found, please try again:';

    console.log("feedbackBox: ", feedbackBox);
    console.log("feedbackText: ", feedbackText);
    console.log("addError: ", addError);
    console.log("delError: ", delError);

    if (feedbackText === addError || feedbackText === delError) {
        feedbackBox.classList.add('usermessage');
    }

    feedbackBox.style.display = "inline-block";  // replace 'display: none' with 'display: inline-block'
    sessionStorage.removeItem('dataPosted');  // clear 'dataPosted' flag so div will be hidden on page reload
}


function getElementY(query) {

    // var navbar = document.getElementById("mainNav");
    // var navbarOffset = navbar.getBoundingClientRect().bottom;
    // var navbarOffset = 65;  // currently hardcoded for non-mobile

    // return window.pageYOffset + document.querySelector(query).getBoundingClientRect().top - navbarOffset
    return window.pageYOffset + document.querySelector(query).getBoundingClientRect().top
}


// Smoothly scrolls to selected accordion element
function doScrolling(element, duration) {

    var startingY = window.pageYOffset;
    var elementY = getElementY(element)

    // If element is close to page's bottom then window will scroll only to some position above the element.
    var targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY
    var diff = targetY - startingY

    // Easing function: easeInOutCubic (https://gist.github.com/gre/1650294)
    var easing = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
    var start

    if (!diff) return

    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
        if (!start) start = timestamp
        var time = timestamp - start  // Elapsed miliseconds since start of scrolling.
        var percent = Math.min(time / duration, 1)  // Get percent of completion in range [0, 1].
        percent = easing(percent)  // Apply the easing.

        window.scrollTo(0, startingY + diff * percent)

            // Proceed with animation as long as we wanted it to.
            if (time < duration) {
                window.requestAnimationFrame(step)
        }
    })
}


// Configures height for correspondingpanel div when accordion button is clicked
function setupAccordions() {

    var acc = document.getElementsByClassName("accordion");

    for (var i = 0; i < acc.length; i++) {

        acc[i].onclick = function() {

            this.classList.toggle("active");
            var panel = this.nextElementSibling;

            if (panel.style.maxHeight){
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                var id = "#" + this.id;
                doScrolling(id, 800);
            } 
        }
    }
}


// Toggle the target readme div when the View Readme button is clicked
function showReadme(target) {

    // readme div
    var element = document.getElementById(target);
    var style = window.getComputedStyle(element);
    var display = style.getPropertyValue("display");

    // panel div - save height when readme div is hidden
    var panel = element.parentNode;
    var curHeight = panel.style.getPropertyValue("max-height");

    if (display === 'none') {
        element.style.display = 'block';
        panel.style.maxHeight = panel.scrollHeight + "px";  // recalculate height
    } else {
        element.style.display = 'none';
        panel.style.maxHeight = curHeight;  // reset to saved height
    }
}


// run after page loaded
$(document).ready(function() {

    // setup the prototype accordions
    setupAccordions();

    // set current animal type in Animal Type drop-down
    setSelectedIndex(document.getElementById("anitype"), currentAniType);

    // shade JSON Updater table rows
    $(".alt_row_color_ani:odd").css("background-color", "rgb(229, 229, 229)")
});


// Set flag when Select Animal Type Submit button is selected
$("#submitAniType").on("click", function() {

    sessionStorage.setItem('animalType', true);
});


// Set flag and reload page when Upload More Photos button is selected
$("#btn_more_photos").on("click", function() {

    sessionStorage.setItem('morePhotos', true);
    window.location.reload();
});


// Set flag and reload page when Reset Photos button is selected
$("#btn_del_photos").on("click", function() {

    sessionStorage.setItem('delPhotos', true);
    window.location.reload();
});


// Function to perform POST request
// - called at bottom of postAnimalInfo() in jsonUpdater.js
// - called in btn_del_photos onclick() in imageUploader.js
function post(path, params, method) {

    method = method || "post"; // Set method to post by default if not specified.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}


// open image uploader accordion to appropriate section
// - TODO - need to generalize these if statements
window.onload = function() {

    if (sessionStorage.getItem('dataPosted') !== null) {
        
        showFeedback();

        acc_img = document.getElementById("acc_json");
        acc_img.classList.toggle("active");
        var panel = acc_img.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
        doScrolling("#acc_json", 800);
    }

    if (sessionStorage.getItem('animalType') !== null) {
    
        acc_img = document.getElementById("acc_json");
        acc_img.classList.toggle("active");
        var panel = acc_img.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
        doScrolling("#acc_json", 800);
        sessionStorage.removeItem('animalType');
    }

    if (sessionStorage.getItem('morePhotos') !== null) {
    
        acc_img = document.getElementById("acc_img");
        acc_img.classList.toggle("active");
        var panel = acc_img.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
        doScrolling("#acc_img", 800);
        sessionStorage.removeItem('morePhotos');
    }

    if (sessionStorage.getItem('delPhotos') !== null) {
    
        acc_img = document.getElementById("acc_img");
        acc_img.classList.toggle("active");
        var panel = acc_img.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
        doScrolling("#acc_img", 800);
        sessionStorage.removeItem('delPhotos');
    }

    if ($("#img-table tr td img").length === 0) {
        document.getElementById('btn_del_photos').style.display = "none";
    }
}