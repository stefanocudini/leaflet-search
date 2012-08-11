<?
/*
 * Leaflet Search Plugin 1.1.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search 
 *
 * Copyright 2012, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 
 What's:
	 php code for testing jsonp and ajax features
	 
	 receive get parameters:
	 	q		 :	search text
	 	callback :	callback name for jsonp request

 Example Ajax:
 	request:
 		search.php?q=dark
 	response:
		{"ok":1,"results":[{"loc":[41.34419,13.242145],"title":"darkblue"},{"loc":[41.67919,13.122145],"title":"darkred"}]}

 Example Jsonp:
 	request:
 		search.php?q=dark&callback=L.Control.Search.callJsonp
 	response:
		L.Control.Search.callJsonp({"ok":1,"results":[{"loc":[41.34419,13.242145],"title":"darkblue"},{"loc":[41.67919,13.122145],"title":"darkred"}]})

 Example Ajax Empty Result:
 	request:
 		search.php?q=xx
 	response:
		{"ok":1,"results":[]}

 Example Error Result:
 	request:
 		search.php?s=dark
 	response:
		{"ok":0,"errmsg":"specify query parameter"}

 	
 */

@header("Content-type: application/json; charset=utf-8");

if(!isset($_GET['q']) or empty($_GET['q']))
	die( json_encode(array('ok'=>0, 'errmsg'=>'specify query parameter') ) );

$jsonp = true;	//active jsonp support
	
$data = json_decode('[
	{"loc":[41.239190,13.032145], "title":"black"},
	{"loc":[41.807149,13.162994], "title":"blue"},
	{"loc":[41.219190,13.062145], "title":"cyan"},
	{"loc":[41.344190,13.242145], "title":"darkblue"},	
	{"loc":[41.679190,13.122145], "title":"darkred"},
	{"loc":[41.319190,13.162145], "title":"gray"},
	{"loc":[41.794008,12.583884], "title":"green"},	
	{"loc":[41.575730,13.002411], "title":"red"},	
	{"loc":[41.546175,13.673590], "title":"yellow"}
]',true);	//simulate few database data

$qreg = $_GET['q'];
$reg = "/^$qreg/i";	//initial search



function searchInit($text)	//search initial text in titles
{
	global $reg;
	return (bool)preg_match($reg, $text['title'],$m);
}

$fdata = array_filter($data,'searchInit');	//filter data by title
$fdata = array_values($fdata);	//reset indexs

$res = array('ok'=>1, 'results'=> $fdata);	//formatting json result
$res = json_encode($res,true);
echo ($jsonp and isset($_GET['callback'])) ? $_GET['callback']."($res)" : $res;

?>
