<?php
class WhipclipSDK
{
	protected $api_url = 'https://api-production-s.whipclip.com/v1';
	protected $version = '4.19';

	//
	//
	//
	function __construct() {
	}

	//
	//
	//
	private function get ( $url, $params )
	{
		// Remove the paging cookie if it came through as false
		if ( isset($_GET['pagingCookie']) && $params['pagingCookie'] === false ) {
			unset($params['pagingCookie']);
		}
		// Setup the URL
		$params['apiVersion'] = $this->version;
		$url = $this->api_url . $url . '?' . http_build_query($params);

		// Make the request
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Accept: application/json'
		));
		$result = curl_exec($ch);

		curl_close($ch);

		$json = json_decode($result, true);
		return $json;
	}

	//
	//
	//
	public function get_post ($id) {
		return $this->get('/posts/' . $id, array());
	}

	//
	//
	//
	public function get_trending ($pagingCookie=false) {
		return $this->get('/posts/trending',
			array(
				'pageSize' => 32,
				'pagingCookie' => $pagingCookie
			));
	}

	//
	//
	//
	public function get_shows ($pagingCookie=false) {
		return $this->get('/shows',
			array(
				'pageSize' => 100,
				'pagingCookie' => $pagingCookie
			));
	}

	//
	//
	//
	public function get_shows_cached () {
		return get_transient( 'whipclip_shows' );
	}

	//
	//
	//
	public function get_trending_by_show ($channel, $show, $pagingCookie=false) {
		return $this->get('/channels/' . $channel . '/shows/' . $show . '/trending',
			array(
				'pageSize' => 16,
				'pagingCookie' => $pagingCookie
			));
	}

	//
	//
	//
	public function get_posts_by_user ($userid, $pagingCookie=false) {
		$result = $this->get('/users/' . $userid . '/userFeed',
			array(
				'freeText' => $userid,
				'pageSize' => 16,
				'pagingCookie' => $pagingCookie
			));
		return $result;
	}

	//
	//
	//
	public function search ($query, $pagingCookie=false) {
		$result = $this->get('/search/content',
			array(
				'freeText' => $query,
				'pageSize' => 32,
				'pagingCookie' => $pagingCookie
			));
		return $result;
	}

	//
	//
	//
	public function search_by_show ($channel, $show, $query, $pagingCookie=false) {
		$result = $this->get('/search/channels/' . $channel . '/shows/' . $show . '/content',
			array(
				'freeText' => $query,
				'pageSize' => 32,
				'pagingCookie' => $pagingCookie
			));
		return $result;
	}

	//
	//
	//
	public function cache_shows () {
		$shows = array();
		$pagingCookie = false;
		do {
			$result = $this->get_shows($pagingCookie);
			$shows = array_merge($shows, $result['shows']);

			if ( $result['pagingContext'] ) {
				$pagingCookie = $result['pagingContext']['forwardCookie'];
			}
		} while ( $result['pagingContext'] );

		delete_transient( 'whipclip_shows' );
		set_transient( 'whipclip_shows', $shows, 604800 );

		return $shows;
	}

}
