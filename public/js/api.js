var mashupEl = {
    apiTitle: $("#apiTitle"),
    apiImage: $("#apiImage"),
    apiImageImg: $("#apiImage img"),
    apiDescription: $("#apiDescription"),
    apiArticleUrl: $("#apiArticleUrl"),
    apiResults: $("#api_results"),
    apiResOpacity: $("#api_results").css("opacity"),
    apiDivider: $("#apiDivider"),
    searchTerm: $("#searchTerm")
};

var mashupUrl = {
    flickrUrl: "https://api.flickr.com/services/feeds/photos_public.gne",
    wikiUrl: "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search="
};

var mashupState = {
    flickr: false,
    wiki: false
}

// Flickr API example via AJAX
function getImage(searchTerm) {

    $.ajax({
        url: mashupUrl.flickrUrl,
        dataType: "jsonp",
        data: { 
            "tags": searchTerm,
            "format": "json"
        }
    });
}


// Get random image from JSON set of 20 images
function jsonFlickrFeed(json) {

    var randIndex = Math.floor(Math.random() * 20);
    var randImage = json.items[randIndex].media.m;

    loadImage(randImage);
};


// Load image if previous fadeout has completed
function loadImage(image) {

    jQuery.noConflict();  // required for imagesLoaded() to work

    if (mashupEl.apiResOpacity === "0") {

        mashupEl.apiImageImg.attr("src", image);

        mashupEl.apiImage.imagesLoaded().done( function(instance) {
            mashupState.flickr = true;
            checkWikiContent();
        });

    } else { // if results div hasn't finished fading yet

        setTimeout(function() {
            loadImage(image);
        }, 100);
    }
}


// Wikipedia API example via fetch:
function getArticleList(searchTerm) {

    var url =  mashupUrl.wikiUrl + searchTerm + "&limit=1"

    fetch(url)
    .then(function(resp) {

        return resp.json();
    })
    .then(function(data) {

        mashupEl.apiTitle.text(data[1][0]);
        mashupEl.apiDescription.text(data[2][0]);
        mashupEl.apiArticleUrl.attr("href", data[3][0]);
    })
};


// Verify Wikipedia content is loaded before resizing panel
function checkWikiContent() {

    if (mashupEl.apiTitle !== "") {

        mashupState.wiki = true;
        evalContentState();

    } else { // if wiki content hasn't loaded yet

        setTimeout(function() {
            checkWikiContent();
        }, 100);
    }
}


// Fade in & resize apiResults div if Flickr & Wikipedia content loaded
function evalContentState() {

    if (mashupState.flickr === true && mashupState.wiki === true) {

        mashupEl.apiDivider.removeClass("div_hide");
        mashupEl.apiResults.fadeIn();
        panelResize("acc_api");
    
    } else {

        console.log("error loading content...");
    }
}


// Update opacity if first search, otherwise fade out apiResults
function evalResOpacity() {

    if (mashupEl.apiResOpacity === "1") { 

        mashupEl.apiResOpacity = "0";

    } else {

        mashupEl.apiResults.fadeOut();
    }
}


// Handle initial and subsequent search on click event
$("#submitSearchTerm").on("click", function() {

    var searchTerm = mashupEl.searchTerm.val();

    mashupState.flickr = false;  // reset states on new search
    mashupState.wiki = false;

    evalResOpacity();
    getArticleList(searchTerm);
    getImage(searchTerm);
});