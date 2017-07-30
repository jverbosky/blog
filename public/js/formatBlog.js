var now = new Date();
var datetime = now.toDateString() + " @ " + (date.getHours()<10?'0':'') + now.getHours() + ":" + (date.getMinutes()<10?'0':'') + now.getMinutes();


// Retrieves blog text from contenteditable div
// - runs via AJAX data request (blog_text)
function getNewBlogText() {
    
    var raw = $("#newBlogText").html();
    var formatted = raw.replace(/<div><br><\/div>/g, '<br>');  // drop div around <br>s
    return formatted;
}


// Refreshes page after new blog is posted
function refreshPage() {

    setTimeout(function () {
        location.reload()
    }, 500);
}


// Makes AJAX POST requests with blog title, timestamp, photo and blog text
// - runs via onclick assigned to Submit Blog button
function postNewBlog() {

    $.ajax({
        url: "/ajax_blog",
        type: "POST",
        data: JSON.stringify({
            blog_title: $("#newBlogTitle").val(),
            blog_date: datetime,
            blog_photo: resized_image.filename,
            blog_text: getNewBlogText()
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