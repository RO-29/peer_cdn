$(document).ready(function() { 
var global = true;
$('#ft-icon').click(function(e){
$('#ft-file').click();

e.preventDefault();

});
$('#ft-file').live("change", function(event) {
 clk();
});


(function() {
var bar = $('.ft-bar');
var percent = $('.ft-percent');
var response = $('#ft-response');
   
$('form').ajaxForm({
    beforeSend: function(xhr) {
        console.log("Upload_in Progress");
     	response.empty();
        var percentVal = '0%';
        bar.width(percentVal);
        percent.html(percentVal);
        $('#ft-cancel').click(function(){
		
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
		var file_stat = jQuery.parseJSON(xhr.responseText);
		response.html("FileName::"+file_stat.name+"<br>FileType::"+file_stat.mimeType+"<br>FileSize::"+file_stat.humansize+"<br><a href='"+file_stat.long_url+"'>ShareUrl</a>");
		console.log(file_stat.name);
	},
    dataType:  'json',             // 'xml', 'script', or 'json' (expected server response type) 
    clearForm: true  ,            // clear all form fields after successful submit 
    resetForm: true             // reset the form after successful submit 
 
		// other available options: 
	
	}); 

})();       
	}); 
 
 
 function clk(){
 
 $("#ft-upload-form").submit();
  console.log("File ready For submitting");
 }
  