<?php
//
// Plugin Name: Whipclip
// Plugin URI: https://www.whipclip.com/wordpress
// Description: Wordpress plugin for Whipclip
// Author: Whipclip
// Author URI: https://www.whipclip.com/
// Version: 1.0.1
//

/*  Copyright 2015 Whipclip

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

$base_dir = realpath(dirname(__FILE__)) . '/';
include_once( $base_dir . 'sdk.php' );

class Whipclip
{
	private static $sdk;

	// Define and register singleton
	private static $instance = false;
	public static function instance() {
		if( !self::$instance )
			self::$instance = new Whipclip;

		return self::$instance;
	}

	/**
	 * Register actions and filters
	 *
	 * @uses add_action, add_filter
	 * @return null
	 */
	private function __construct() {
		// 
		self::$sdk = new WhipclipSDK();

		// 
		register_activation_hook( __FILE__, array( $this, 'activate' ) );

		// Enqueue essential assets
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue' ) );

		// Whipclip media button, to the post editor
		add_action( 'media_buttons', array( $this, 'media_buttons' ), 20 );

		// Create view templates, for the admin pop in the post editor
		add_action( 'print_media_templates', array( $this, 'print_media_templates' ) );

		// Register shortcodes
		add_action( 'init', array( $this, 'add_oembed_support' ) );

		// Handle shortcode alignment
		add_filter( 'embed_oembed_html', array( $this, 'resize_embed' ), 10, 4 );

		// AJAX endpoint
		add_action( 'wp_ajax_whipclip', array( $this, 'my_action_whipclip' ) );
	}

	function activate() {
		self::$sdk->cache_shows();
	}

	//
	// Register shortcodes
	//
	function add_oembed_support() {
		// Adds Whipclip to the whitelist, allowing all users who can write posts to use this provider.
		wp_oembed_add_provider( 'https://www.whipclip.com/video/*', 'https://www.whipclip.com/oembed' );
	}

	//
	// API
	//
	function my_action_whipclip() {
		global $wpdb; // this is how you get access to the database

		// Check if method passed in or not
		if ( !isset($_GET['method']) ) {
			return '{}';
			wp_die();
		}

		// Check if there is a paging cookie
		$paging = false;
		if ( isset($_GET['page']) ) {
			$paging = urldecode($_GET['page']);
		}

		$result = 0;
		switch ( $_GET['method'] ) {
			case 'get_trending':
				$result = self::$sdk->get_trending($paging);
				break;
			case 'get_shows':
				$result = self::$sdk->get_shows_cached();
				break;
			case 'cache_shows':
				$result = self::$sdk->cache_shows();
				break;
			case 'get_post':
				$id = $_GET['id'];
				$result = self::$sdk->get_post($id);
				break;
			case 'get_trending_by_show':
				$channel = $_GET['channel'];
				$show = $_GET['show'];
				$result = self::$sdk->get_trending_by_show($channel, $show, $paging);
				break;
			case 'get_posts_by_user':
				$userid = $_GET['userid'];
				$result = self::$sdk->get_posts_by_user($userid, $paging);
				break;
			case 'search_by_show':
				$channel = $_GET['channel'];
				$show = $_GET['show'];
				$query = $_GET['query'];
				$result = self::$sdk->search_by_show($channel, $show, $query, $paging);
				break;
			case 'search':
				$query = $_GET['query'];
				$result = self::$sdk->search($query, $paging);
				break;
		}

		echo json_encode($result);
		wp_die(); // Terminate immediately and return a response
	}

	/**
	 * Filter for resizing and alignment
	 */
	function resize_embed( $html, $url, $attr, $postid ) {

		// check that this is a whipclip embed
		if ( strpos( $url, 'https://www.whipclip.com/video/' ) === 0 ) {

			// Override max-width adjustment on iframes
			$html = str_replace('<iframe ', '<iframe style="max-width: initial" ', $html);

			// Readjust iframe Alignment
			if ( isset( $attr['align'] ) && in_array( $attr['align'], array( 'left', 'center', 'right' ) ) ) {
				// container div must be displayed as block, rather than inline-block for center align
				if ( $attr['align'] == 'center' || $attr['align'] == 'right' ) {
					$html = '<div style="text-align:' . $attr['align'] . '">' . $html . '</div>';
				}
			}

			// Readjust iframe Dimensions
			if ( $attr['height'] / $attr['width'] > 0.6 ) {
				$attr['height'] = 315;
				$attr['width'] = 560;
			} 

			$html = preg_replace(array('/height=\'[0-9]+\'/','/width=\'[0-9]+\'/'), array("height='" . $attr['height'] . "'", "width='" . $attr['width'] . "'"), $html);

		}

		return $html;
	}

	/**
	 * Include all of the templates
	 */
	function print_media_templates() {
		include( __DIR__ . '/templates.php' );
	}

	/**
	 * Enqueue all assets used for admin view. Localize scripts.
	 */
	function admin_enqueue() {
		global $pagenow;

		// Only operate on edit post pages
		if( $pagenow != 'post.php' && $pagenow != 'post-new.php' )
			return;

		// Ensure all the files required by the media manager are present
		wp_enqueue_media();

		wp_enqueue_script( 'whipclip-cookie', plugins_url( '/js/js.cookie.js', __FILE__ ), array(), 1, true );
		wp_enqueue_script( 'whipclip-moment', plugins_url( '/js/moment.js', __FILE__ ), array(), 1, true );
		wp_enqueue_script( 'whipclip-api', plugins_url( '/js/whipclip-api.js', __FILE__ ), array( 'whipclip-moment' ), 1, true );
		wp_enqueue_script( 'whipclip-functions', plugins_url( '/js/functions.js', __FILE__ ), array( 'whipclip-api' ), 1, true );
		wp_enqueue_script( 'whipclip-media-manager', plugins_url( '/js/media-manager.js', __FILE__ ), array( 'whipclip-functions' ), 1, true );
		wp_enqueue_script( 'whipclip-register-events', plugins_url( '/js/register-events.js', __FILE__ ), array( 'whipclip-media-manager' ), 1, true );

		// Styles and fonts for the admin
		wp_enqueue_style( 'whipclip-embed', plugins_url( '/css/styles.css', __FILE__ ) );
		wp_enqueue_style( 'font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css', array(), '4.0.3' );
	}

	/**
	 * Add "Embed Whipclip" button to edit screen
	 *
	 * @action media_buttons
	 */
	function media_buttons( $editor_id = 'content' ) { ?>
		<a href="#" id="insert-whipclip-button" class="button whipclip-embed-activate add_media"
			data-editor="<?php echo esc_attr( $editor_id ); ?>"
			title="<?php esc_attr_e( "Whipclip Embed", 'whipclip-embed' ); ?>"><span class="whipclip-media-buttons-icon"></span><?php esc_html_e( "Whipclip Embed", 'whipclip-embed' ); ?></a>
	<?php
	}

}

Whipclip::instance();

