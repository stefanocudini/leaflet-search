Package.describe({
	summary: "Leaflet Control Search"
});

Package.on_use(function (api, where) {
	api.add_files('leaflet-search.js', 'client');
	//TODO server side searching...
	api.add_files('leaflet-search.css', 'client');
	api.add_files('images/search-icon.png', 'client');
	api.add_files('images/loader.gif', 'client');
});
