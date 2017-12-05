$(function () {
  var navbar = $('.navbar')
  var resBtn = $('.resbtn');
  var ulList = $('.navigation');
   resBtn.on('click', function () {
       if(ulList.height() == 0) {
           ulList.animate({height: '15.2em'}, 300);
       }else {
           ulList.animate({height: '0em'}, 300);
       }
   });

   $(window).resize(function () {

    if($(window).width() > 916) {

       navbar.css('overflow', 'hidden');

    } else {

       navbar.css('overflow', 'visible');
    }

   });
});