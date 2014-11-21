$(document).ready(function() { 
var global = true;
$('#iflychat-ft-icon').click(function(e){
console.log("hey");
$('#iflychat-ft-file').click();

e.preventDefault();

});
$('#iflychat-ft-file').live("change", function(event) {
 clk();
});

/*$('#iflychat-ft-cancel').click(function(){
console.log("cancelled!:/");
global = false;
});*/
(function() {
var bar = $('.iflychat-ft-bar');
var percent = $('.iflychat-ft-percent');
var response = $('#iflychat-ft-response');
   
$('form').ajaxForm({
    beforeSend: function(xhr) {
        console.log("Upload_in Progress");
     	response.empty();
        var percentVal = '0%';
        bar.width(percentVal);
        percent.html(percentVal);
        $('#iflychat-ft-cancel').click(function(){
		
		xhr.abort();
		alert("Aborted");
		});
		return true;
    },
    uploadProgress: function(event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        bar.width(percentVal)
        percent.html(percentVal);
        
		},
    success: function() {
        var percentVal = '100%';
        bar.width(percentVal)
        percent.html(percentVal);
    },
	complete:function(xhr) {
		response.html(JSON.stringify(xhr.responseText,null,4));
		console.log("Completed successfully!! "+xhr.responseText);
	},
    dataType:  'json',             // 'xml', 'script', or 'json' (expected server response type) 
    clearForm: true  ,            // clear all form fields after successful submit 
    resetForm: true             // reset the form after successful submit 
 
		// other available options: 
	
	}); 

})();       
	}); 
 
 
 function clk(){
 
 $("#iflychat-ft-upload-form").submit();
  console.log("File ready For submitting");
 }
  