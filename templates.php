<script type="text/html" id="tmpl-whipclip-content">

	<div class="whipclip-browser-container">

		<div id="whipclip-filter">
			
			<span class="whipclip-show-select">
				<select name="show">
					<option value="all">Filter Media</option>
				</select>
			</span>
		</div>

		<div id="whipclip-search">
			<input type="text" placeholder="Enter keywords..." id="whipclip-search-input" class="search search-primary" />
			<a class="button media-button button-large media-button-searchButton" disabled="disabled">Search</a>
		</div>

		<h1 id="whipclip-header" class="whipclip-header whipclip-user-off"></h1>
		<h1 id="whipclip-header-2" class="whipclip-header whipclip-user-on"></h1>

		<a href="#" id="whipclip-back" class="whipclip-user-on">
			<i class="fa fa-arrow-left"></i> Go Back
		</a>

		<div id="whipclip-results" class="whipclip-grid-type whipclip-user-off"></div>
		<div id="whipclip-user-results" class="whipclip-grid-type whipclip-user-on"></div>
	</div>

	<div class="whipclip-sidebar-container">
		<div class="whipclip-sidebar">
			<div class="media-sidebar">
				&nbsp;
			</div>
		</div>
	</div>

	<iframe id="no-target" name="no-target" style="display: none;"></iframe> 

</script>


<!-- Show drop down list -->
<script type="text/html" id="tmpl-whipclip-show-filter">
	<option value="{{ data.value }}">{{ data.name }}</option>
</script>


<script type="text/html" id="tmpl-whipclip-post-list">

	<div class="whipclip-post" data-postid="{{ data.id }}">
		<div class="whipclip-post-gradient">
			<div class="whipclip-image-container">
				<img src="{{ data.coverImage.representations[0].url }}" />
				<span><i class="fa fa-play"></i></span>
			</div>
			<div class="whipclip-post-description">
				<h2 class="name">{{ data.program.name }}</h2>
				<p class="description">
					<# if ( data.program.specialShowName ) { #>{{ data.program.specialShowName }}<# } #>
					<# if ( data.program.episodeMetadata ) { #>Season {{ data.program.episodeMetadata.seasonNumber }} Episode {{ data.program.episodeMetadata.episodeNumber }}<# } #>
				</p>
			</div>
		</div>
	</div>

</script>


<script type="text/html" id="tmpl-whipclip-title-bar">

	<h1 class="whipclip-title">Whipclip Embed</h1>

	<div class="whipclip-title-bar-right">
		<div id="get-updates">
			<input placeholder="Get email updates from Whipclip!" type="text" class="text-input" />
			<input type="submit" value="Submit" class="button media-button button-primary" />
		</div>
	</div>

</script>


<script type="text/html" id="tmpl-whipclip-show-more">

	<div class="whipclip-show-more">
		<a href="#">Show more</a>
	</div>

</script>


<script type="text/html" id="tmpl-whipclip-post-details">

	<h3>Display Options</h3>
	<div class="whipclip-display-options">
		<dl class="whipclip-post-details">
			<dt>Align</dt>
			<dd>
				<select class="whipclip-display-align">
					<option value="none" selected="selected">None</option>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</dd>
			<dt>Size</dt>
			<dd>
				<select class="whipclip-display-size">
				</select>
			</dd>
			<dt>Autoplay Clip?</dt>
			<dd><input type="checkbox" name="whipclip-autoplay" value="true"></dd>
		</dl>
	</div>

	<iframe class="whipclip-embed" src='https://www.whipclip.com/embed/{{ data.id }}?autoplay=1&sharing=false' frameborder='0' allowfullscreen></iframe>

	<p class="whipclip-post-message">{{ data.message }}</p>

	<dl class="whipclip-post-details">
		<dt>Author</dt>
		<dd>{{ data.author.userProfile.name }} (<a href="#" data-user-id="{{ data.author.userProfile.id }}" id="author-link">{{ data.author.userProfile.handle }}</a>)</dd>

		<dt>Created</dt>
		<dd>{{ moment(data.creationTime).format('MMMM Do YYYY, h:mm A') }}</dd>

		<dt>Show</dt>
		<dd>{{ data.program.name }}</dd>

		<# if ( data.program.specialShowName ) { #>
		<dt>Artist</dt>
		<dd>{{ data.program.specialShowName }}</dd>
		<# } else if ( data.program.episodeMetadata ) { #>
		<dt>Clipped from</dt>
		<dd>Season {{ data.program.episodeMetadata.seasonNumber }} Episode {{ data.program.episodeMetadata.episodeNumber }}</dd>
		<# } #>

	</dl>

</script>


<!-- Size Dropdown Template -->
<script type="text/html" id="tmpl-whipclip-size-dropdown">

	<option value="{{ data.width }}_{{ data.height }}"<# if ( data.name == 'Default' ) { #> selected="selected"<# } #>>{{ data.name }} - {{ data.width }} x {{ data.height }}</option>

</script>



