// Flickr API example via AJAX
function getImage(searchTerm) {
  
    $.ajax({
        url: 'https://api.flickr.com/services/feeds/photos_public.gne',
        dataType: 'jsonp',
        data: { 
            "tags": searchTerm,
            "format": "json"
        },
        success: function() {
          console.log("Image request successful");
        },
        complete: function() {
          // panelResize();
        }
    });
}


// Get random image from JSON set of 20 images
function jsonFlickrFeed(json) {

    var randIndex = Math.floor(Math.random() * 20);
    $("#apiImage img").attr("src", json.items[randIndex].media.m);

    setTimeout(function(){
        panelResize();
    }, 500);
};


// Wikipedia API example via fetch:
function getArticleList(searchTerm) {

    var url = "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=" + searchTerm + "&limit=1";
    fetch(url)
    .then(function(resp) {
        // console.log("response: ", resp);
        return resp.json();
    })
    .then(function(data) {

        // console.log("data: ", data);
        // console.log("searchTerm: ", data[0]);
        // console.log("title: ", data[1][0]);
        // console.log("description: ", data[2][0]);
        // console.log("articleUrl: ", data[3][0]);

        $("#apiTitle").text(data[1][0]);
        $("#apiDescription").text(data[2][0]);
        $("#apiArticleUrl").attr("href", data[3][0]);
        document.getElementById("apiArticleUrl").classList.remove("linkHide");
        document.getElementById("apiDivider").classList.remove("divHide");
    })
};


// Adjust height of API Mashup accordion panel
function panelResize() {
    var acc_api = document.getElementById("acc_api");
    // var acc_api.classList.toggle("active");
    var panel = acc_api.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
}



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