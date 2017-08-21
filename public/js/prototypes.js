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