
/*
<div class="leaflet-control-search">
	<input class="search" type="text" size="10" placeholder="Search..." />
</div>
*/

L.Control.Search = L.Control.extend({

	options: {
		position: "topleft",
		text: "Search..."
	},

	onAdd: function (map) {
		var container,
			containerClass = 'leaflet-control-search';
		
		container = L.DomUtil.create('div', containerClass);
		
		this._createInput(this.options.text, 'search-input', container, map);
		this._createButton(this.options.text, 'search-button', container, map, this._tootip);
		
		return container;
	},

	_createInput: function (text, className, container, context) {
		var input = L.DomUtil.create('input', className, container);
		input.type = 'text';
		input.size = text.length-2;
		input.placeholder = text;

//		L.DomEvent
//			.addListener(input, 'click', L.DomEvent.stopPropagation)
//			.addListener(input, 'click', L.DomEvent.preventDefault)
//			.addListener(input, 'click', fn, context);
//		
		return input;
	},
	
	_createButton: function (text, className, container, context, fn) {
		var button = L.DomUtil.create('a', className, container);
		button.href = '#';
		button.title = text;

//		L.DomEvent
//			.addListener(button, 'click', L.DomEvent.stopPropagation)
//			.addListener(button, 'click', L.DomEvent.preventDefault)
//			.addListener(button, 'click', fn, context);
//		
		return button;
	},
	
	_tooltip: function () {
		console.log('apri tooltip');
	}
//	_update_href: function() {
//		var params = L.Util.getParamString(this._params);
//		var sep = '?';
//		if (this.options.useAnchor) sep = '#';
//		var url = this._url_base + sep + params.slice(1);
//		if (this._href) this._href.setAttribute('href', url);
//		if (this.options.useLocation)
//			location.replace('#' + params.slice(1));
//		return url;
//	},

//	_update: function(obj, source) {
//		//console.info("Update", obj, this._params);
//		for(var i in obj) {
//			if (!obj.hasOwnProperty(i)) continue;
//			if (obj[i] != null && obj[i] != undefined)
//				this._params[i] = obj[i]
//			else
//				delete this._params[i];
//		}

//		this._update_href();
//	},

//	_set_center: function(e)
//	{
//		//console.info("Update center", e);
//		var params = e.params;
//		if (params.zoom == undefined ||
//		    params.lat == undefined ||
//		    params.lon == undefined) return;
//		this._map.setView(new L.LatLng(params.lat, params.lon), params.zoom);
//	}
});

