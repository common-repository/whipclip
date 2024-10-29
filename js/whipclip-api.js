//
//
//
var WhipclipAPI = (function($){

	var apiURL = '/wp-admin/admin-ajax.php';
	var posts = {}; // To cache the posts that have already been retrieved
	var shows = {}; // To cache show metadata

	return {

		//
		// Gets a list of trending posts
		// @param {String} cookie
		// @returns {Post|Array}
		//
		getTrending: function(cookie) {
			var params = {
				action: 'whipclip',
				method: 'get_trending'
			};

			if ( typeof cookie !== 'undefined' ) params['page'] = cookie;

			return $.getJSON(apiURL, params, function(data) {
				// Save the post data locally
				for ( var i=0; i<data.posts.length; i++ ) {
					posts[data.posts[i].id] = data.posts[i];
				}

				return(data);
			});
		},

		//
		// Gets a list of posts for a given query
		// @param {String} query
		// @param {String} cookie
		// @return {Post|Array}
		//
		search: function(query, cookie) {
			var params = {
				action: 'whipclip',
				method: 'search',
				query: query
			};

			if ( typeof cookie !== 'undefined' ) params['page'] = cookie;

			return $.getJSON(apiURL, params, function(data) {
				data.posts = [];

				// Normalize the results into "posts" as an array
				// Example: data.posts = [ {...}, {...}, {...} ]
				if ( data.results.length > 0 ) {
					for ( var i=0; i<data.results.length; i++ ) {
						if ( data.results[i].post ) {
							posts[data.results[i].post.id] = data.results[i].post;
							data.posts.push(data.results[i].post);
						}
					}
				}

				return(data);
			});
		},

		//
		// Gets a list of posts for a given query within a show
		// @param {String} channel
		// @param {String} show
		// @param {String} query
		// @return {Post|Array}
		//
		searchByShow: function(channel, show, query, cookie) {
			var params = {
				action: 'whipclip',
				method: 'search_by_show',
				channel: channel,
				show: show,
				query: query
			};

			if ( typeof cookie !== 'undefined' ) params['page'] = cookie;
			return $.getJSON(apiURL, params, function(data){
				data.posts = [];

				// Normalize the results into "posts" as an array
				// Example: data.posts = [ {...}, {...}, {...} ]
				if ( data.results.length > 0 ) {
					for ( var i=0;i<data.results.length;i++ ) {
						if ( data.results[i].post ) {
							posts[data.results[i].post.id] = data.results[i].post;
							data.posts.push(data.results[i].post);
						}
					}
				}

				return(data);
			});
		},

		//
		// Gets a single post
		// @param {String} id
		// @returns {Post}
		//
		getPost: function(id) {
			// Check cache first, else hit the API directly
			if ( typeof posts[id] === "object" ) {
				var dfd = jQuery.Deferred();
				dfd.resolve(posts[id]);
				return dfd.promise();
			} else {
				return $.getJSON(apiURL, {
					action: 'whipclip',
					method: 'get_post',
					id: id
				}, function(data) {
					return(data);
				});
			}
		},

		//
		// Gets a list of shows
		// @param {String} cookie
		// @return {Show|Array}
		// 
		getShows: function() {
			return $.getJSON(apiURL, {
				action: 'whipclip',
				method: 'get_shows'
			}, function(shows) {
				return(shows);
			});
		},

		//
		// Gets a list of shows
		// @param {String} cookie
		// @return {Show|Array}
		// 
		cacheShows: function() {
			return $.getJSON(apiURL, {
				action: 'whipclip',
				method: 'cache_shows'
			}, function(shows) {});
		},

		//
		// Gets a list of trending posts from specified show
		// @param {String} show
		// @param {String} cookie
		// @return {Post|Array}
		//
		getTrendingByShow: function(channel, show, cookie) {
			var params = {
				action: 'whipclip',
				method: 'get_trending_by_show',
				channel: channel,
				show: show
			};

			if ( typeof cookie !== 'undefined' ) params['page'] = cookie;
			return $.getJSON(apiURL, params, function(data){
				return(data);
			});
		},

		//
		//
		//
		getPostsByUser: function(userId, cookie) {
			var params = {
				action: 'whipclip',
				method: 'get_posts_by_user',
				userid: userId,
			};

			if ( typeof cookie !== 'undefined' ) params['page'] = cookie;
			return $.getJSON(apiURL, params, function(data){
				return(data);
			});
		}

	};

})(jQuery);
