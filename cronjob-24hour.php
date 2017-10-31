<?php
require_once('database.php');

$server = 'http://127.0.0.1:444/'; // Change it to your server Ip and Port running /nodejs/index.js
// Don't Forget Slash '/' in the end of URL.
// Important '/'  -_-


$file=file_get_contents('$server?id=1'); // Get Top 200 Witness List and Add New Witnesses To Database
foreach(json_decode($file) as $x){
	$user = $x->owner;
	$result = $conn->query("SELECT EXISTS(SELECT `id` FROM `witnesses` WHERE `user` = '$user')");
	foreach($result as $z){
		foreach($z as $k){
			$l = $k;
		}
	}
	if(!$l){
		$result = $conn->query("INSERT INTO `witnesses`(`user`,`totalmiss`) VALUES ('$user','$x->miss')");
		echo '+';
	}
}

echo 'done';

?>