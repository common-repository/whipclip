//
// Add our interface to the Wordpress media manager
//
(function($) {

	var media = wp.media;

	//
	// Constructor for the admin's HTML
	//
	var WhipclipView = media.View.extend({

		className: 'whipclip-content',

		template: media.template('whipclip-content'),

		initialize: function() {
			Whipclip.listShows();
			Whipclip.showTrending();
		}

	});

	//
	//
	//
	var WhipclipToolbar = media.view.Toolbar.extend({

		className: 'whipclip-toolbar media-toolbar',

		initialize: function(options) {
			var self = this;
			media.view.Toolbar.prototype.initialize.apply(this, arguments);

			this.button = new media.view.Button({
				text: "Insert into post",
				style: 'primary',
				disabled: true,
				priority: 10
			});

			// this.collection.on('selection:single change:attachment', this.updateButton, this);

			this.primary.set('button', this.button);
			// this.secondary.set('selection', this.selection);
		}

	});

	//
	// Constructor for the admin's HTML
	//
	var WhipclipTitleBar = media.View.extend({

		template: media.template('whipclip-title-bar'),

		className: 'whipclip-title-bar',

	});

	//
	// Add our Whipclip Embed tab
	//
	media.controller.WhipclipTab = media.controller.State.extend({

		handlers: {
			'content:create:whipclip-content': 'createContent',
			'toolbar:create:whipclip-toolbar': 'createToolbar',
			'title:create:whipclip-title-bar': 'createTitleBar',
		},

		initialize: function() {
			if($.browser.msie && $.browser.version < 10) {
				this.set('unsupported', true);
			}
		},

		turnBindings: function(method) {
			var frame = this.frame;

			_.each(this.handlers, function(handler, event) {
				this.frame[method](event, this[handler], this);
			}, this);
		},

		activate: function() {
			if(this.get('unsupported')) {
				this.frame.$el.addClass('whipclip-unsupported-browser');
				return;
			}

			this.turnBindings('on');

			this.set('toolbar', 'whipclip-toolbar');
		},

		deactivate: function() {
			this.turnBindings('off');
		},

		// render main content (search toolbar)
		createContent: function(content) {
			content.view = new WhipclipView({
				controller: this.frame,
				model: this
			});
		},

		createToolbar: function(toolbar) {
			toolbar.view = new WhipclipToolbar({
				controller: this.frame,
				collection: this.get('selection')
			});
		},

		createTitleBar: function(title) {
			title.view = new WhipclipTitleBar({
				controller: this,
			});
		},

	});

	//
	// Constructor for the Whipclip Interface
	//
	var WhipclipEmbedFrame = function(parent) {

		return {

			createStates: function() {
				parent.prototype.createStates.apply( this, arguments );

				this.states.add([
					new media.controller.WhipclipTab({
						id: 'whipclip-embed',
						title: 'Whipclip Embed',
						titleMode: 'whipclip-title-bar',
						// multiple: true,
						// router: false,
						menu: 'default', // Left rail in the image popup
						content: 'whipclip-content',
						// selection: new media.model.Selection(null, { multiple: true }),
					}),
				]);
			}

		}

	};

	//
	// Add this to the Wordpress interface
	//
	media.view.MediaFrame.Post = media.view.MediaFrame.Post.extend(WhipclipEmbedFrame(media.view.MediaFrame.Post));

})(jQuery);
