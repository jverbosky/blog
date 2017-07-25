function formatText(tag) {
    
    var txtarea = document.getElementById("newBlogText");
    var start = txtarea.selectionStart;
    var finish = txtarea.selectionEnd;
    var allText = txtarea.value;
    var sel = allText.substring(start, finish);
    var newText=allText.substring(0, start)+"<"+tag+">"+sel+"</"+tag+">"+allText.substring(finish, allText.length);
    
    txtarea.value=newText;
}


function refreshPage() {

    setTimeout(function () {
        location.reload()
    }, 500);
}


function postNewBlog() {

    $.ajax({

      url: "/ajax_verify",
      type: "POST",
      data: JSON.stringify({
        blog_title: $("#newBlogTitle").val(),
        blog_date: new Date().toDateString(),
        blog_text: $("#newBlogText").val()
      }),
      dataType: "json",
      success: function(data, status, xhr) {}
    });

    refreshPage();
}

$("#btnPostNewBlog").on("click", postNewBlog);