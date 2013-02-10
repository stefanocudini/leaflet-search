<?php
/*
 * Leaflet Search Plugin 1.1.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search 
 *
 * http://easyblog.it/maps/leaflet-search
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
		[{"loc":[41.34419,13.242145],"title":"darkblue"},{"loc":[41.67919,13.122145],"title":"darkred"}]

 Example Jsonp:
 	request:
 		search.php?q=dark&callback=L.Control.Search.callJsonp
 	response:
		L.Control.Search.callJsonp([{"loc":[41.34419,13.242145],"title":"darkblue"},{"loc":[41.67919,13.122145],"title":"darkred"}])

 Example Bulk data:
 	request:
 		search.php?q=roma&cities=1
 	response:
		[{"title":"Romainville","loc":[48.8854,2.43482]},{"title":"Roma","loc":[41.89474,12.4839]},{"title":"Roman","loc":[46.91667,26.91667]}]


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
	die( json_encode(array('ok'=>0, 'errmsg'=>'specify q parameter') ) );

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
]',true);	//simulate database data
//the searched field is: title

if(isset($_GET['cities']))	//for ajax-bulk.html example
	$data = json_decode( file_get_contents('cities15000.json'), true);
//load big data store, cities15000.json (about 14000 records)

function searchInit($text)	//search initial text in titles
{
	$qreg = $_GET['q'];
	$reg = "/^$qreg/i";	//initial case insensitive searching
	return (bool)preg_match($reg, $text['title']);
}
$fdata = array_filter($data, 'searchInit');	//filter data
$fdata = array_values($fdata);	//reset $fdata indexs

if(isset($_GET['packed']))
	$fdata = array('ok'=>1, 'results'=> $fdata);	//packaging data, view jsonp-filtered.html example

$json = json_encode($fdata,true);

#usleep(200000);	//simulate connection latency for localhost test

echo isset($_GET['callback']) ? $_GET['callback']."($json)" : $json;	//support for jsonp request




?>
