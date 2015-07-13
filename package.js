Package.describe({
	name: "stefcud:leaflet-search",
	version: "1.6.0",
	summary: "Leaflet Control Search"
});

Package.on_use(function (api, where) {
	api.add_files('dist/leaflet-search.min.js', 'client');
	api.add_files('dist/leaflet-search.min.css', 'client');
	api.add_files('images/search-icon.png', 'client');	
	api.add_files('images/loader.gif', 'client');
	//TODO server-side searching...	
});
