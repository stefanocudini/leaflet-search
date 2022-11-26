/*
this file is work in progress and represent an extension
of the main plugin to support programmatically most famous geocoder services

the base idea is:
- any geocoder services is identified by name passed to the plugin option
- any geocoder sub module implemnt custom parameters anc a custom callback to extract resulta in leaflet search format result
- any geocoder accept only two parameters, api key and user key, passed to remote service

any contributions is welcome <3

*/
(function (factory) {
  // eslint-disable-next-line
  if (typeof define === 'function' && define.amd) {
    // AMD
    // eslint-disable-next-line
    define(['leaflet'], factory)
  } else if (typeof module !== 'undefined') {
    // Node/CommonJS
    module.exports = factory(require('leaflet'))
  } else {
    // Browser globals
    if (typeof window.L === 'undefined') { throw new Error('Leaflet must be loaded first') }
    factory(window.L)
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
    /* onAdd: function (map) {
    L.Control.Search.prototype.onAdd.call(this, map);
    console.log('Geocoder',this.options)
  }, */
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
          } */
    }
  })
})
