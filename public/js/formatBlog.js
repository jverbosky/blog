var now = new Date();
var datetime = now.toDateString() + " @ " + now.getHours() + ":" + now.getMinutes();


function getNewBlogText() {
    
    var raw = $("#newBlogText").html();
    var formatted = raw.replace(/<div><br><\/div>/g, '<br>');
    return formatted;
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