var slideshowIds = ['#tictactoe', '#phonebook', '#calculator', '#sunshine', '#anpanman']
var divString = '%id% > div:gt(0)'
var firstString = '%id% > div:first'
var idString = '%id%'


// Crossfades images on portfolio page
function slideshow(div, first, id) {

  $(div).hide();

  setInterval(function() { 
    $(first)
      .fadeOut(1500)
      .next()
      .fadeIn(1500)
      .end()
      .appendTo(id);
  },  5000);

}


// When page is loaded, build variables and run slideshow()
$(document).ready(function() { 

  for (var i = 0; i < slideshowIds.length; i++) {

    newDiv = divString.replace(/%id%/gi, slideshowIds[i]);
    newFirst = firstString.replace(/%id%/gi, slideshowIds[i]);
    newId = idString.replace(/%id%/gi, slideshowIds[i]);

    slideshow(newDiv, newFirst, newId);
  }

 });