$(document).ready(function() {
        
        $('#local').draggable({ scroll:false });
    
        $('.local').on('mousedown', function (e) {
        var wrapper = $('#local'),
        rect = wrapper[0].getBoundingClientRect(),
        y = e.clientY - rect.top;
        

    if (y > $('.local')[0].height - 40) {
        console.log("y > ->"+y);
        //wrapper.draggable('disable');
    }
    });
    $('.local').on('mouseup', function (e) {  
        $('#local').draggable('enable');
        });

        $("#local").click(function(){
          //$("#video").css("position",$("#video").css("position")=="absolute" ? "fixed!important":"absolute");
          $(".local").toggleClass("centre");
          var toggleWidth = $(".local").css("max-width") == "250px" ? "500px" : "250px";
          var width = toggleWidth;
          var toggleheight = $(".local").css("max-height") == "250px" ? "500px" : "250px";
          var height = toggleheight
          $(".local").css("max-width",width);
          $(".local").css("max-height",height);
            
        });
        
      
    
   })