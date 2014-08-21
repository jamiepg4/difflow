$(document).ready(function(){
	$("tr").click(function(){
	  window.location.href = '/difftool/' + $(this).attr('data-job-id').replace(/["']/g, "");
	});
  	$("#setBaseline").click(function(){
  		$(this).attr('disabled', 'disabled');
	  	$.ajax({
		      type: "POST",
		      url: '/server/baseline',
		      data: {
		    	testId: $(this).attr('data-test-id'),
		    	timelineId: $(this).attr('data-timeline-id')
		      },
		      success: function (argument) {
		        alert('New Baseline Added!');  
		      },
		      error: function(){
		        alert('Whoops. Something happened, please try later.');
		      }
    	});
	});
    

});

