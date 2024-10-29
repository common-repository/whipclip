(function($) {
var media = wp.media;

$(document).ready(function() {

	// Register handler for whipclip-embed button which brings the
	// user directly to the Whipclip Embed view
	$(document.body).on('click', '.whipclip-embed-activate', function(e) {
		e.preventDefault();
		Whipclip.showMediaManager();
	});

	// Typing in the search input field
	$(document.body).on('keyup', '#whipclip-search-input', function(e) {
		if ( e.keyCode == 13 ) {
			$('#whipclip-search .media-button-searchButton').click();
		}

		var button = $('#whipclip-search .media-button-searchButton');
		if ( this && this.value.length > 0 ) {
			button.removeAttr('disabled');
		} else {
			button.attr('disabled', 'disabled');
		}
	});

	// Clicking on the search button
	$(document.body).on('click', '#whipclip-search .media-button-searchButton', function(e) {
		e.preventDefault();

		// If there was something typed, then search for it, else show trending.
		var query = $('#whipclip-search-input').val(),
			showFilter = $('.whipclip-show-select select').val();

		$('.whipclip-user-on').hide();
		$('#whipclip-user-off').show();

		var resultsTable = $('#whipclip-results');

		resultsTable.off('scroll');
		resultsTable.empty();
		resultsTable.scrollTop(0);

		if ( query ) {
			
			if ( showFilter === 'all' ){

				Whipclip.search(query);
				$('#whipclip-header').html('Searching for "' + query + '"');

			} else {

				var channel = showFilter.split('+')[0],
					show = showFilter.split('+')[1],
					show_name = $('.whipclip-show-select select option[value="' + showFilter + '"]').text();
				$('#whipclip-header').html('Searching for "' + query + '" from <small>' + show_name + '</small>');
				Whipclip.searchByShow(channel, show, show_name, query);
				
			}

		} else {
			$('#whipclip-header').html('Trending Clips');
			Whipclip.showTrending();
		}
	});

	// When you click on a post, show its details in the right column
	$(document.body).on('click', '.whipclip-post', function(e) {
		var postid = $(this).data("postid");
		var self = this;
		Whipclip.showPostDetails(postid);
		
		$('.whipclip-post').each(function(){
			$(this).removeClass('selected');
		})

		$(this).addClass('selected');
		$('.whipclip-toolbar .media-toolbar-primary .media-button').removeAttr('disabled');
	});

	// When you click the "insert into post" button
	$(document.body).on('click', '.whipclip-toolbar .media-toolbar-primary .media-button', function(e){
		$('.whipclip-post').each(function(){

			var postid,
				align = $('.whipclip-display-align').val(),
				width = parseInt($('.whipclip-display-size').val().split('_')[0]),
				height = parseInt($('.whipclip-display-size').val().split('_')[1]),
				autoplay = $('input[name=whipclip-autoplay]').prop('checked');

			if ( $(this).hasClass('selected') ) {
				postid = $(this).attr('data-postid');
			}

			if ( typeof postid !== 'undefined' ) {
				media.editor.insert( "\n" + Whipclip.embedShortcode(postid, align, width, height, autoplay) + "\n" );
			}

			// silence the video
			var currentSrc = $('.whipclip-embed').attr('src');
			$('.whipclip-embed').attr('src', currentSrc.replace('autoplay=1&', ''));

		});
	});

	// When you change the show dropdown list
	$(document.body).on('change', '.whipclip-show-select select', function(){

		$('.whipclip-user-on').hide();
		$('.whipclip-user-off').show();
		$('#whipclip-search-input').val("");

		var resultsTable = $('#whipclip-results');

		resultsTable.off('scroll');
		resultsTable.empty();
		resultsTable.scrollTop(0);

		if ($(this).val() == 'all'){

			$('#whipclip-header').html('Trending Clips');
			Whipclip.showTrending();

		} else {

			var channel_id = $(this).val().split('+')[0],
				show_id = $(this).val().split('+')[1],
				show_name = $(this).find('option[value="' + $(this).val() + '"]').text();

			$('#whipclip-header').html('Trending Clips From <small>' + show_name + '</small>');
			Whipclip.showTrendingByShow(channel_id, show_id, show_name);
		}
		
	});

	// When you click the 'x' close button on the modal
	$(document.body).on('click', '.media-modal-close', function (){
		// silence the video
		var currentSrc = $('.whipclip-embed').attr('src');
		if ( currentSrc ) {
			$('.whipclip-embed').attr('src', currentSrc.replace('autoplay=1&', ''));
		}
	});

	// When you click the author's handle
	$(document.body).on('click', '#author-link', function(){ 
		var user_id = $(this).attr("data-user-id"),
			user_handle = $(this).text();

		$('#whipclip-header-2').html('Clipped by <small>' + user_handle + '</small>');
		$('.whipclip-user-off').hide();
		$('.whipclip-user-on').show();

		var resultsTable = $('#whipclip-user-results');

		resultsTable.off('scroll');
		resultsTable.empty();
		resultsTable.scrollTop(0);

		$('#whipclip-header').hide();

		Whipclip.showPostsByUser(user_id);
	});

	// When you click the back button
	$(document.body).on('click', '#whipclip-back', function(){
		$('#whipclip-back').hide();
		$('#whipclip-header-2').hide();
		$('#whipclip-user-results').hide();
		$('#whipclip-results').show();
		$('#whipclip-header').show();
	});

	var whipclipUpdates = Cookies.get('whipclip-update');
	if ( whipclipUpdates ) {
		$('head').append('<style>#get-updates { display: none; }</style>');
	}

	// When you click the back button
	$(document.body).on('click', '#get-updates input[type=submit]', function(){
		var email = $('#get-updates input[type=text]').val();
		if ( email ) {
			// Make sure they can't submit again
			$('#get-updates').html("Thanks, you will hear from us soon!");

			// Drop a cookie so they don't see the message any more.
			Cookies.set('whipclip-update', true, { expires: 30 });

			// Send the request
			Whipclip.submitEmail(email);
		}
	});

});
})(jQuery);
