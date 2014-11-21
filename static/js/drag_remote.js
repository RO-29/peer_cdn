$(document).ready(function() {
        
        $('#remote').draggable({ scroll:false });
    
        $('.remote').on('mousedown', function (e) {
        var wrapper = $('#remote'),
        rect = wrapper[0].getBoundingClientRect(),
        y = e.clientY - rect.top;
        

    if (y > $('.remote')[0].height - 40) {
        console.log("y > ->"+y);
        //wrapper.draggable('disable');
    }
    });
    $('.remote').on('mouseup', function (e) {  
        $('#remote').draggable('enable');
        });

        $("#remote").click(function(){
          //$("#video").css("position",$("#video").css("position")=="absolute" ? "fixed!important":"absolute");
          $(".remote").toggleClass("centre");
          var toggleWidth = $(".remote").css("max-width") == "250px" ? "500px" : "250px";
          var width = toggleWidth;
          var toggleheight = $(".remote").css("max-height") == "250px" ? "500px" : "250px";
          var height = toggleheight
          $(".remote").css("max-width",width);
          $(".remote").css("max-height",height);
            
        });
        
      
    
   })