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