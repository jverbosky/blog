var now = new Date();
var datetime = now.toDateString() + " @ " + now.getHours() + ":" + now.getMinutes();


function parseDivText() {
    
    var htmlString = "";
    var temp = "";
    
    $("#newBlogText div").each(function() {
        temp = $(this).html();
        htmlString += "<br>" + ((temp == "<br>") ? "" : temp);
    });
    
    console.log("htmlString: ", htmlString);
    return htmlString;
}


// Function to refresh page - called after new blog is posted
function refreshPage() {

    setTimeout(function () {
        location.reload()
    }, 500);
}


// Function to make AJAX POST requests with blog text and photo
function postNewBlog() {

    $.ajax({
        url: "/ajax_blog",
        type: "POST",
        data: JSON.stringify({
            blog_title: $("#newBlogTitle").val(),
            blog_date: datetime,
            blog_photo: resized_image.filename,
            blog_text: parseDivText()
        }),
        dataType: "json",
        success: function(data, status, xhr) {}
    });

    if (resized_image.filename !== undefined) {
        $.ajax({
            url: "/ajax_photo",
            type: 'POST',
            data: {
                filename: resized_image.filename, 
                data: resized_image.data
            },
            success: function(data, status, xhr) {
                console.log("Photo uploaded successfully.");
            }
        });
    } else {
        console.log("No photo uploaded for this blog post.");
    }

    refreshPage();
}