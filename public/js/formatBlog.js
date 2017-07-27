var now = new Date();
var datetime = now.toDateString() + " @ " + now.getHours() + ":" + now.getMinutes();


// ----- in progress, need to research more and test
// - per http://jsfiddle.net/sathyamoorthi/BmTNP/5/

// function ParseDIVText() {
    
//     var domString = "", temp = "";
    
//     $("#div-editable div").each(function() {
//         temp = $(this).html();
//         // domString += "<br>" + ((temp == "<br>") ? "" : temp);
//         domString += ((temp == "<br>") ? "" : temp) + "<br>";
//     });
    
//     alert(domString);
// }

// ------------------------------------------------------------


// Function to allow selected text in textarea field to be formatted
function formatText(tag) {
    
    var txtarea = document.getElementById("newBlogText");
    var start = txtarea.selectionStart;
    var finish = txtarea.selectionEnd;
    var allText = txtarea.value;
    var sel = allText.substring(start, finish);
    var newText=allText.substring(0, start)+"<"+tag+">"+sel+"</"+tag+">"+allText.substring(finish, allText.length);
    
    txtarea.value=newText;
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
            blog_text: $("#newBlogText").val(),
            blog_photo: resized_image.filename
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