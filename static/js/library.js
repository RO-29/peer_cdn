

var helper = (function() {

  var progressBar = document.getElementById('progressBar');
  function animateSpinner() {
    progressBar.classList.add('animated');
    progressBar.style.display = 'block';
  }
  function stopSpinner() {
    progressBar.classList.remove('animated');
    progressBar.style.display = 'none';
  }


    function selectCall() {
    return {video: true, audio: true};
    
  }

  function modifyForm(room_name) {
   
  }

  function setRoomLink (room) {
    var url = window.location.origin + '/room/' + room;
     }

  return {
    animateSpinner: animateSpinner,
    stopSpinner: stopSpinner,
    selectCall: selectCall,
    modifyForm: modifyForm,
    setRoomLink: setRoomLink
  };
}());


