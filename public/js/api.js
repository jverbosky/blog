var mashupEl = {
    apiTitle: $("#apiTitle"),
    apiImage: $("#apiImage"),
    apiImageImg: $("#apiImage img"),
    apiDescription: $("#apiDescription"),
    apiArticleUrl: $("#apiArticleUrl"),
    apiResults: $("#api_results"),
    apiDivider: $("#apiDivider"),
    searchTerm: $("#searchTerm")
};

var mashupUrl = {
    flickrUrl: "https://api.flickr.com/services/feeds/photos_public.gne",
    wikiUrl: "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search="
};

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

    jQuery.noConflict();  // required for imagesLoaded() to work

    var randIndex = Math.floor(Math.random() * 20);
    var randImage = json.items[randIndex].media.m;

    mashupEl.apiImageImg.attr("src", randImage);

    mashupEl.apiImage.imagesLoaded().done( function(instance) {

        checkWikiContent();
    });
};


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
        mashupEl.apiArticleUrl.removeClass("link_hide");
        mashupEl.apiDivider.removeClass("div_hide");
    })
};


// Verify Wikipedia content is loaded before resizing panel
function checkWikiContent() {

    if (mashupEl.apiTitle !== "") {

        mashupEl.apiResults.removeClass("div_hide");
        panelResize("acc_api");
        mashupEl.apiResults.fadeIn();

    } else { // if wiki content hasn't loaded yet

        setTimeout(function() {

            checkWikiContent();
        }, 100);
    }
}


$("#submitSearchTerm").on("click", function() {

    // hide and reset elements on new search
    mashupEl.apiResults.fadeOut();
    mashupEl.apiTitle.text("");
    mashupEl.apiDescription.text("");
    mashupEl.apiArticleUrl.attr("href", "");

    searchTerm = mashupEl.searchTerm.val();
    getArticleList(searchTerm);
    getImage(searchTerm);
});