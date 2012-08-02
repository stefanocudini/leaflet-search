
/*
<div class="leaflet-control-search">
	<input class="search" type="text" size="10" placeholder="Search..." />
</div>
*/

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events, 

	options: {
		position: "topleft",
		text: "Search..."
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._params = {};
		this.on("update", this._set_center, this);
		for (var i in this) {
			if (typeof(i) === "string" && i.indexOf('initialize_') == 0)
				this[i]();
		}
	},

	onAdd: function(map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-search');
		L.DomEvent.disableClickPropagation(this._container);
		this._map = map;
		this._input = L.DomUtil.create('input', null, this._container);
		this._input.value = this.options.text;

		map.on('moveend', this._update_center, this);
		this.fire("update", {params: this._params})
		this._update_center();

		if (this.options.useAnchor && 'onhashchange' in window) {
			var _this = this, fn = window.onhashchange;
			window.onhashchange = function() {
				_this._set_urlvars();
				if (fn) return fn();
			}
		}

		this.fire('add', {map: map});

		return this._container;
	},

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

