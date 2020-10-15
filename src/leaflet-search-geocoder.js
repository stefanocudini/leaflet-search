
(function (factory) {
    if(typeof define === 'function' && define.amd) {
    //AMD
        define(['leaflet'], factory);
    } else if(typeof module !== 'undefined') {
    // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
    // Browser globals
        if(typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
})(function (L) {

L.Control.Search.include({
	options: {
		geocoder: 'google',
		markerLocation: true,
		autoType: false,
		autoCollapse: true,
		minLength: 2
	},
/*	onAdd: function (map) {
		L.Control.Search.prototype.onAdd.call(this, map);
		console.log('Geocoder',this.options)
	},*/
	geocoders: {
    /*
        'google': {
        	urlTmpl: "//maps.googleapis.com/maps/api/geocode/json?key={key}&address={text}"
          //todo others
        },
        'here': {
        	urlTmpl: https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey={apiKey}&searchtext={text}"
          params: function(opts, text) {
            
            //opts is leaflet options input
            //text is input text searched

            return {
              'apiKey': opts.apikey,
              'format': 'json',
              'q': text,
        			'jsonp': 'herejsoncallback',
            };
          },
          callback: function(resp) {
              //TODO refact resp data
          }
        	
        		"//nominatim.openstreetmap.org/search?"
        }*/
	}
});

});
