// Flickr API example via AJAX
function getImage(searchTerm) {
  
    $.ajax({
        url: 'https://api.flickr.com/services/feeds/photos_public.gne',
        dataType: 'jsonp',
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

    $("#apiImage img").attr("src", randImage);

    $("#apiImage").imagesLoaded().done( function(instance) {

        $("#api_results").removeClass("div_hide");
        panelResize("acc_api");
    });
};


// Wikipedia API example via fetch:
function getArticleList(searchTerm) {

    var url = "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=" + searchTerm + "&limit=1";
    fetch(url)
    .then(function(resp) {

        return resp.json();
    })
    .then(function(data) {

        $("#apiTitle").text(data[1][0]);
        $("#apiDescription").text(data[2][0]);
        $("#apiArticleUrl").attr("href", data[3][0]);
        document.getElementById("apiArticleUrl").classList.remove("link_hide");
        document.getElementById("apiDivider").classList.remove("div_hide");
    })
};


$("#submitSearchTerm").on("click", function() {

    $("#apiTitle").text("");
    $("#apiDescription").text("");
    $("#apiArticleUrl").attr("href", "");

    searchTerm = $("#searchTerm").val();
    getArticleList(searchTerm);
    getImage(searchTerm);
});

// $("searchFor").val()
// searchTerm = "pug";
// getImages(searchTerm);
// getArticleList(searchTerm);