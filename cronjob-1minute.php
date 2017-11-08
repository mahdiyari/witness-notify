<?php
require_once('functions.php');
require_once('database.php');

$server = 'http://127.0.0.1:444/'; // Change it to your server Ip and Port running /nodejs/index.js
// Don't Forget Slash '/' in the end of URL.
// Important '/'  -_-

// For Witnesses from 1 to 100

$res = json_decode(call('get_witnesses_by_vote','"","100"')); //Get Witnesses List from 1 to 100 (max is 100)
$result = $res->result;
$last = $result[99]->owner;
foreach($result as $data){ // Foreach All Witnesses from 1 to 100
	$userr = $data->owner;
	$resultt = $conn->query("SELECT EXISTS(SELECT `totalmiss` FROM `witnesses` WHERE `user` ='$userr')"); //Checking if Witness is in database or not
	foreach($resultt as $l){
    	foreach($l as $l){}
	}
	if($l == 1){ // If Witness Exists
		$resulttt = $conn->query("SELECT `userid`, `totalmiss`,`username`,`missed`,`lastconfirm` FROM `witnesses` WHERE `user`='$userr'"); //Get Witness Saved Information from Database
		foreach($resulttt as $y){}
		$totalmiss = $y['totalmiss'];
		$total_missed = $data->total_missed;
		$last_confirmed_block_num = $data->last_confirmed_block_num;
		if(is_numeric($totalmiss) && is_numeric($total_missed) && is_numeric($last_confirmed_block_num)){
			if($y['userid'] != 0 && $y['userid'] != null && $y['userid'] != ''){ // For Mention in Discord
				$userid = $y["userid"];
			}else{
				$userid = '';
			}
			if($y['username'] != null && $y['username'] != ''){ // For Mention in Steemit.chat
				$uname = $y["username"];
			}else{
				$uname = '';
			}
			if($y['missed'] == 1){ // Checking If Witnesses Recovered
				$lastconfirm = $y['lastconfirm'];
				if($lastconfirm < $last_confirmed_block_num){
					file_get_contents("$server?u=$userr&idd=$userid&type=2&block=$last_confirmed_block_num"); // Sending Recovered Message to Discord Channel
					file_get_contents("$server?u=$userr&uname=$uname&type=2&block=$last_confirmed_block_num&id=2&miss=$total_missed"); // Sending Recovered Message to https://steemit.chat/channel/witness-blocks
					$result = $conn->query("UPDATE `witnesses` SET `missed`=0,`lastconfirm`='$last_confirmed_block_num' WHERE `user`='$userr'"); // Updating Database
				}
			}
			if($totalmiss < $total_missed){ // Checking If Witnesses Missed
				file_get_contents("$server?u=$userr&idd=$userid&type=1"); // Sending Missed Message to Discord Channel
				file_get_contents("$server?u=$userr&id=2&type=1&uname=$uname&miss=$total_missed");  // Sending Missed Message to https://steemit.chat/channel/witness-blocks
				$result = $conn->query("UPDATE `witnesses` SET `totalmiss`='$total_missed',`missed`=1,`lastconfirm`='$last_confirmed_block_num' WHERE `user`='$userr'");//Updating Database
			}
		}
	}
}


// Repeated Codes For Witnesses from 100 to 200

$res = json_decode(call('get_witnesses_by_vote','"'.$last.'","100"')); //Get Witnesses List from 100 to 200 (max is 100)
$result = $res->result;
foreach($result as $data){
	$userr = $data->owner;
	$resultt = $conn->query("SELECT EXISTS(SELECT `totalmiss` FROM `witnesses` WHERE `user` ='$userr')"); //Checking if Witness is in database or not
	foreach($resultt as $l){
    	foreach($l as $l){}
	}
	if($l == 1){
		$resulttt = $conn->query("SELECT `userid`, `totalmiss`,`username`,`missed`,`lastconfirm` FROM `witnesses` WHERE `user`='$userr'"); //Get Witness Saved Information from Database
		foreach($resulttt as $y){}
		$totalmiss = $y['totalmiss'];
		$total_missed = $data->total_missed;
		$last_confirmed_block_num = $data->last_confirmed_block_num;
		if(is_numeric($totalmiss) && is_numeric($total_missed) && is_numeric($last_confirmed_block_num)){
			if($y['userid'] != 0 && $y['userid'] != null && $y['userid'] != ''){
				$userid = $y["userid"];
			}else{
				$userid = '';
			}
			if($y['username'] != null && $y['username'] != ''){
				$uname = $y["username"];
			}else{
				$uname = '';
			}
			if($y['missed'] == 1){ // Checking If Witnesses Recovered
				$lastconfirm = $y['lastconfirm'];
				if($lastconfirm < $last_confirmed_block_num){
					file_get_contents("$server?u=$userr&idd=$userid&type=2&block=$last_confirmed_block_num"); // Sending Recovered Message to Discord Channel
					file_get_contents("$server?u=$userr&uname=$uname&type=2&block=$last_confirmed_block_num&id=2&miss=$total_missed"); // Sending Recovered Message to https://steemit.chat/channel/witness-blocks
					$result = $conn->query("UPDATE `witnesses` SET `missed`=0,`lastconfirm`='$last_confirmed_block_num' WHERE `user`='$userr'"); //Updating Database
				}
			}
			if($totalmiss < $total_missed){ // Checking If Witnesses Missed
				file_get_contents("$server?u=$userr&idd=$userid&type=1"); // Sending Missed Message to Discord Channel
				file_get_contents("$server?u=$userr&id=2&type=1&uname=$uname&miss=$total_missed"); // Sending Missed Message to https://steemit.chat/channel/witness-blocks
				$result = $conn->query("UPDATE `witnesses` SET `totalmiss`='$total_missed',`missed`=1,`lastconfirm`='$last_confirmed_block_num' WHERE `user`='$userr'"); //Updating Database
			}
		}
	}
}


?>
