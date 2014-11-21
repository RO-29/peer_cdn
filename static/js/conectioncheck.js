//Just regular stuff to store connection lost in case of user net disconnects
function checkConnectivity() {

    $j.ajax({
        beforeSend: function() {
            $j('#connection').css('display', '');
        },
        type: "POST",
        url: "https://connectioncheck.herokuapp.com/",
        success: function(html) {
            $j('#connection').css('display', 'none');
            //console.log('connected'+html);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if(clicked ==1)
             localStorage.setItem("connection", "lost");
            $j('#connection').css('display', 'none');
            console.log("Connection Lost: " + textStatus);;
            clearInterval(clear);


        }
    });
}
 