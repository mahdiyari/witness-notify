<?php
require_once('nodes.php'); // get availabe node

function call($x,$y){ //(Method, Params)
	$data = '{"jsonrpc": "2.0", "method": "'.$x.'", "params": ['.$y.'], "id": 1}';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $GLOBALS['node']);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	$result = curl_exec($ch);
	if($resultx = json_decode($result)->result){
	    
	}else{
	    $resultx = false;
	}
	if($resultx == false || $resultx == null || $resultx == ''){
		return 0;
	}else{
		return $result;
	}
	curl_close($ch);
}
?> 
