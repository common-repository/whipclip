//
//
//
var Whipclip = (function($){

	var media = wp.media;

	var maxLength = 24;

	var sizes = [
		{ name: 'Small', height: 197, width: 350 },
		{ name: 'Default', height: 315, width: 560 },
		{ name: 'Large', height: 360, width: 640 },
		{ name: 'Full Size', height: 480, width: 853 }
	];

	// http://codex.wordpress.org/Javascript_Reference/wp.template
	var postListTemplate = wp.template('whipclip-post-list');
	var postDetailsTemplate = wp.template('whipclip-post-details');
	var showMoreTemplate = wp.template('whipclip-show-more');
	var postDisplaySizesTemplate = wp.template('whipclip-size-dropdown');
	var showFilterTemplate = wp.template('whipclip-show-filter');

	return {
		//
		//
		//
		headerText: "whipclip-header",
		resultsTable: "whipclip-results",

		//
		// Log the most recent show action (i.e. Trending, Search By Show, etc.)
		//
		lastShow: {
			func: 'showTrending',
			params: []
		},

		//
		// Change the header text
		//
		updateHeader: function(html) {
			$("#" + headerText).html(html);
		},

		//
		// Reset the results table
		//
		resetResults: function() {
			$("#" + resultsTable).off('scroll');
			$("#" + resultsTable).empty();
			$("#" + resultsTable).scrollTop(0);
		},

		//
		//
		//
		showMediaManager: function() {
			if ( !media.frames.whipclip ) {
				media.frames.whipclip = wp.media.editor.open(wpActiveEditor, {
					state: 'whipclip-embed',
					frame: 'post'
				});
			} else {
				media.frames.whipclip.open(wpActiveEditor);
			}
		},

		//
		//
		//
		showPostList: function(posts, table) {
			var html = "";
			var resultsTable = ( typeof table === 'undefined' ) ? $("#whipclip-results") : $(table);

			for ( var i=0; i<Math.min(maxLength, posts.length); i++ ) {
				// Make sure that it has a picture to show
				if ( posts[i].coverImage ) {
					html += postListTemplate(posts[i]);
				}
			}

			resultsTable.html( resultsTable.html() + html );
		},

		//
		//
		//
		showPostDetails: function(postid){
			WhipclipAPI.getPost(postid)
			.then(function(post){
				var html = postDetailsTemplate(post);
				var sizeOptions = sizes.map(function(s){ return postDisplaySizesTemplate(s); }).join();
				$(".whipclip-sidebar .media-sidebar").html(html);
				$(".whipclip-sidebar .whipclip-display-size").html(sizeOptions);
			})
		},

		//
		//
		//
		showTrending: function(cookie) {

			WhipclipAPI.getTrending(cookie)
			.then(function(data){

				// define results table element
				var resultsTable = $("#whipclip-results"); 

				if ( typeof cookie === 'undefined' ) {
					$("#whipclip-header").text("Trending Clips");
				}

				if ( data.posts.length > 0 ) {
					// render results using template
					Whipclip.showPostList(data.posts); 

					// record the forward cookie ( to detect duplicates )
					resultsTable.attr("data-fwd", data.pagingContext.forwardCookie);

					// call infinite scroll listener
					Whipclip.infiniteScroll(Whipclip.showTrending, [data.pagingContext.forwardCookie]);
				} else {
					// API call has reached end of results
					resultsTable.attr("data-fwd", "end");
				}

				// if first API call returns 0 results
				if ( data.posts.length == 0 && typeof cookie === 'undefined' ) {
					self.el.html("Sorry, an error occurred.");
				}

			});
		},

		//
		//
		//
		search: function(query, cookie) {

			WhipclipAPI.search(query, cookie)
			.then(function(data){

				// define results table element
				var resultsTable = $("#whipclip-results");

				if ( typeof cookies === 'undefined') {
					Whipclip.lastShow.func = 'search';
				}

				Whipclip.lastShow.params = [query, cookie];

				if ( data.posts.length > 0 ) {
					// check for duplicate renders
					if ( (typeof resultsTable.attr("data-fwd") == 'undefined') || data.pagingContext.forwardCookie !== resultsTable.attr("data-fwd") ) {

						// render results using template
						Whipclip.showPostList(data.posts);

						// record the forward cookie
						resultsTable.attr("data-fwd", data.pagingContext.forwardCookie);

						Whipclip.infiniteScroll(Whipclip.search, [query, data.pagingContext.forwardCookie]);
					}
				} else {
					// if API calls have reached the end of the results
					resultsTable.attr("data-fwd", "end");
				}

				// if 0 results are returned on first API call
				if ( data.posts.length == 0 && typeof cookie === 'undefined') {
					$("#whipclip-results").html("Sorry, we found zero results matching your search.");
				}

			});
		},

		//
		//
		//
		showTrendingByShow: function(channel, show, show_name, cookie){

			WhipclipAPI.getTrendingByShow(channel, show, cookie)
			.then(function(data){

				// define results table element
				var resultsTable = $("#whipclip-results"); 

				if ( typeof cookie === 'undefined') {

					Whipclip.lastShow.func = 'showTrendingByShow';
				}
				Whipclip.lastShow.params = [channel, show, show_name, cookie];

				if ( data.posts.length > 0 ) {
					// check for duplicate renders
					if ( data.pagingContext.forwardCookie !== resultsTable.attr("data-fwd") ) {

						// render results using template
						Whipclip.showPostList(data.posts); 

						// record the forward cookie ( for next api call )
						resultsTable.attr("data-fwd", data.pagingContext.forwardCookie);

						Whipclip.infiniteScroll(Whipclip.showTrendingByShow, [channel, show, show_name, data.pagingContext.forwardCookie]);
					}
				} else {
					resultsTable.attr("data-fwd", "end");
				}

				if ( data.posts.length == 0 && typeof cookie === 'undefined' ) {

					$('#whipclip-results').html("Sorry, there are no trending clips for this show.");

				}
			})
		},

		//
		//
		//
		searchByShow: function(channel, show, show_name, query, cookie) {

			WhipclipAPI.searchByShow(channel, show, query, cookie)
			.then(function(data){

				// define results table element
				var resultsTable = $("#whipclip-results"); 

				if ( typeof cookie === 'undefined')
					Whipclip.lastShow.func = "searchByShow";
				Whipclip.lastShow.params = [channel, show, show_name, query, cookie];

				if ( data.posts.length > 0 ) {

					// render results using template
					Whipclip.showPostList(data.posts); 

					// record the forward cookie ( for next api call )
					resultsTable.attr("data-fwd", data.pagingContext.forwardCookie);

					Whipclip.infiniteScroll(Whipclip.searchByShow, [channel, show, show_name, query, data.pagingContext.forwardCookie]);
					

				} else {

					// no more entries to pull
					resultsTable.attr("data-fwd", "end");

				}

				if ( data.posts.length == 0 && typeof cookie === 'undefined' ) {

					$('#whipclip-results').html("Sorry, there are no clips relating to your query from this show.");

				}
			})

		},

		//
		//
		//
		showPostsByUser: function(user_id, cookie) {

			WhipclipAPI.getPostsByUser(user_id, cookie)
			.then(function(data){
				// define results table element
				var resultsTable = $("#whipclip-user-results"); 

				if ( data.posts.length > 0 ) {

					// render results using template
					Whipclip.showPostList(data.posts, "#whipclip-user-results"); 

					// record the forward cookie ( for next api call )
					resultsTable.attr("data-fwd", data.pagingContext.forwardCookie);

					Whipclip.infiniteScroll(Whipclip.showPostsByUser, [user_id, data.pagingContext.forwardCookie], "#whipclip-user-results");
					

				} else {

					// no more entries to pull
					resultsTable.attr("data-fwd", "end");

				}

				if ( data.posts.length == 0 && typeof cookie === 'undefined' ) {

					$('#whipclip-user-results').html("Sorry, this user has no clips.");

				}
			})

		},

		//
		//
		//
		embedShortcode: function(postid, align, width, height, autoplay){
			var embedUrl = 'https://www.whipclip.com/video/';

			var embedCode = embedUrl + postid;

			if ( autoplay ) embedCode += "?autoplay=1";

			// only add [embed] shortcode if options aren't default
			if ( align !== 'none' || ( width !== sizes[1].width && height !== sizes[1].height ) ) {
				var attrs = {};

				if ( align !== 'none' ) attrs['align'] = align;
				if ( width !== sizes[1].width ) attrs['width'] = width;
				if ( height !== sizes[1].height ) attrs['height'] = height;

				embedCode = wp.shortcode.string({
							tag: 'embed',
							content: embedCode,
							attrs: attrs
						});
			}

			return embedCode;
		},

		//
		// 
		//
		listShows: function(cookie){
			var shows = [];
			var cookie;
			var html = '';

			WhipclipAPI.getShows()
			.then(function(results){
				var shows = [];
				for ( var i=0; i<results.length; i++ ) {
					shows.push({
						name: results[i].name,
						value: results[i].channel.id + "+" + results[i].id
					});
				}

				for ( var i=0;i<shows.length;i++ ) {
					html += showFilterTemplate(shows[i]);
				}

				$('#whipclip-filter select').html($('#whipclip-filter select').html() + html);

				// Quietly update the shows in the background
				WhipclipAPI.cacheShows();
			});
		},

		//
		//
		//
		infiniteScroll: function(retrievalFunction, params, table) {
			var resultsTable = ( typeof table === 'undefined' ) ? $('#whipclip-results') : $(table);
			params = ( typeof params === 'undefined' ) ? [] : params;
			resultsTable.off('scroll');

			resultsTable.scroll(function(){
				// check if div scroll reached bottom and that this is the correct display
				if ( $(this).attr('data-fwd') != 'end' && (this.scrollHeight - $(this).scrollTop() == $(this).outerHeight() ) ) {	

					// get more clips
					retrievalFunction.apply(null, params);
				}
			});

			// Get more content, if there wasn't enough pulled the first time around.
			if ( $('#whipclip-results .whipclip-post').length < 12 ) {
				$('#whipclip-results').scroll();
			}
		},

		//
		//
		//
		submitEmail: function (email) {
			var emailAddress = encodeURIComponent(email);

			// Build URL
			var formId = '14r8xOkC9DNKeI5LJIBET9nUb28yF818BVuuH-AkEs04';
			var url = 'https://docs.google.com/forms/d/' + formId + '/formResponse?entry.1095635425=';
			var submitRef = '&submit=submit';
			var submitURL = url + emailAddress;

			$("#no-target").attr("src", submitURL);
		}

	};

})(jQuery);
