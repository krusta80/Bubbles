$(document).ready(function() {
  
  $('#bubbles').on('submit','#iWannaPlay', function(ev) {
    ev.preventDefault();
    
    var name = $(this).find('#name').val();
    
    if (!name) {
      $('#popup').find('.errorMsg').html("You have to put in a name to start!");
      return;
    }
    socket.emit('iWannaPlay', {name: name});
    $("#popup").hide();
  });


  $('#leaderboard').on('click', '.button', function(ev) {
    if ($(this).parent().hasClass('closed')) {
      $(this).parent().removeClass('closed');
      $(this).parent().find('.cont').show();
      return;
    }
    $(this).parent().addClass('closed');
    $(this).parent().find('.cont').hide();
  });



});