<?
/*
 * Leaflet Search Plugin 1.0.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search 
 *
 * Copyright 2012, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 */

@header("Content-type: text/plain; charset=utf-8");

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

$res = array('ok'=>1, 'results'=> $fdata);	//formatting json result

echo json_encode($res);

?>
