/*
 * Leaflet Search Plugin 1.0.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search
 *
 * Copyright 2012, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 */

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events, 
	
	options: {
		layerSearch: new L.LayerGroup(),	//layer where search elements, default: empty layer	
		propFilter: 'title',	//property of elements filtered
		initialSearch: true,	//search text by initial
		autoPan: true,  //auto panTo when click on tooltip
		animatePan: true,	//animation after panTo
		autoResize: true,	//autoresize on input change
		zoom: null,	//zoom after pan to location found, default: map.getZoom()
		position: 'topleft',
		text: 'Search...',	//placeholder value
		textErr: 'Location not found'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
		this.timeAutoclose = 1200;		//delay for autoclosing alert and minimize after blur
		this.timeKeypress = 300;	//delay after keypress into _input
		this._recordsCache = null;	//key,value table! that store locations!
	},

	onAdd: function (map) {
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-search');					
		this._alert = this._createAlert('search-alert');		
		this._input = this._createInput(this.options.text, 'search-input');
		this._createButton(this.options.text, 'search-button');
		this._tooltip = this._createTooltip('search-tooltip');
//		var that = this; map.on('mousedown',function(e) { that._animateLocation(e.latlng); });
//uncommnt for fast test _animateLocation
		return this._container;
	},

	onRemove: function(map) {
		delete this._recordsCache;//free memory
	},
	
	showAlert: function(text) {
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		},this.timeAutoclose);
	},
	
	maximize: function() {
		this._input.style.display = 'block';
		this._input.focus();
	},
	
	minimize: function() {
		this._hideTooltip();
		this._input.value ='';
		this._input.size = this._inputMinSize;
		this._alert.style.display = 'none';
		this._input.style.display = 'none';
	},
	
	autoMinimize: function() {	//minimize after delay, used on_input blur
		var that = this;
		this.timerMinimize = setTimeout(function() {
			that.minimize();
		}, this.timeAutoclose);
	},

	autoMinimizeStop: function() {
		clearTimeout(this.timerMinimize);
	},
	
	_createAlert: function(className) {
		var alert = L.DomUtil.create('div', className, this._container);
		alert.style.display = 'none';
		return alert;
	},

	_createInput: function (text, className) {
		var input = L.DomUtil.create('input', className, this._container);
		input.type = 'text';
		input.size = this._inputMinSize,
		input.value = '';
		input.placeholder = text;
		input.style.display = 'none';
		
		L.DomEvent
			.disableClickPropagation(input)
			.addListener(input, 'keyup', this._handleAutoresize, this)
			.addListener(input, 'keyup', this._handleKeypress, this)
			.addListener(input, 'blur', this.autoMinimize, this)
			.addListener(input, 'focus', this.autoMinimizeStop, this);
			
		return input;
	},

	_createButton: function (text, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'click', this._handleSubmit, this)
			.addListener(button, 'focus', this.autoMinimizeStop, this)
			.addListener(button, 'blur', this.autoMinimize, this);

		return button;
	},

	_createTooltip: function(className) {
		var tool = L.DomUtil.create('div', className, this._container);
		tool.style.display = 'none';
		return tool;
	},

	_createTip: function(text) {	//make new choice for tooltip
		var tip = L.DomUtil.create('a', 'search-tip', this._tooltip);
			tip.href = '#',
			tip.innerHTML = text;

		L.DomEvent
			.disableClickPropagation(tip)
			.addListener(tip, 'click', function(e) {
				this._input.value = text;
				this._input.focus();
				this._hideTooltip();
				this._handleAutoresize();	
				if(this.options.autoPan)//go to location
					this._handleSubmit();
			}, this);

		return tip;
	},	
	//////end DOM creations

	_showTooltip: function(text) {	//show tooltip with filtered this._recordsCache

		if(text.length<1)	//TODO add tooltip min length
		{
			this._hideTooltip();
			return false;
		}

		var I = this.options.initialSearch ? '^' : '',  //search for initial text
			reg = new RegExp(I + text,'i'),
			results = 0;

		this._tooltip.innerHTML = '';
		
		for(key in this._recordsCache)
		{
			if(reg.test(key))//filter
			{
				this._createTip(key);
				results++;
			}
		}
		if(results>0)
			this._tooltip.style.display = 'block';
		else
			this._hideTooltip();

		return results;
	},

	_hideTooltip: function() {
		this._tooltip.style.display = 'none';
		this._tooltip.innerHTML = '';
	},
	
	_requestJsonp: function(url, cb) {
		L.Control.Search.callJsonp = function(data) {
			this._recordsCache = cb(data);
		}
		var el = L.DomUtil.create('script','', document.getElementsByTagName('body')[0] ),
			delim = url.indexOf('?') >= 0 ? '&' : '?',
			rnd = Math.floor(Math.random()*10000);  //random param for disable browser cache

		el.type = 'text/javascript';
		el.src = "" + url + delim +"callback=L.Control.Search.callJsonp";
	},

	_recordsFromLayer: function(layerSearch, propFilter) {	//return table: key,value from layer
		
		var retRecords = {};
		
		layerSearch.eachLayer(function(marker) {	//iterate elemets in layer
		//TODO filter by element type: marker|polyline|circle...
			var key = marker.options.hasOwnProperty(propFilter) && marker.options[propFilter] || '';

			if(key)
				retRecords[key] = marker.getLatLng();

		},this);

		return retRecords;
	},

	_handleKeypress: function (e) {
		switch(e.keyCode)
		{
			case 27: //Esc
				this.minimize();
			break;
			case 13: //Enter
				this._handleSubmit();	//do search
			break;
			case 37://Left
			case 39://Right
			case 16://Shift
			case 17://Ctrl
			//case 32://Space
			break;
			//TODO scroll tips, with shortcuts 38(up),40(down)
			default://All keys
				clearTimeout(this.timerKeypress);
				var that = this;
				this.timerKeypress = setTimeout(function() {	//delay before request, for limit jsonp/ajax request

//					this._requestJsonp('autocomplete.php?q='+this._input.value, function(jsonraw) {
//						console.log(jsonraw);
//						var jsonret = {};
//						for(i in jsonraw.results)
//							jsonret[i]= L.latLng(jsonraw.results[i]);
//						return jsonret;
//					});

				var layerSearch = that.options.layerSearch,
					propFilter = that.options.propFilter;
				if(!that._recordsCache)		//initialize records, first time, or always for jsonp search
					that._recordsCache = that._recordsFromLayer(layerSearch, propFilter);	//fill table key,value from markers into layerSearch
				
				that._showTooltip(that._input.value);	//show tooltip with filter records by this._input.value			

				}, that.timeKeypress);
		}
	},	
	
	_handleAutoresize: function() {	//autoresize this._input
		if(this.options.autoResize)
			this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},
	
	_handleSubmit: function(e) {	//search button action
	
		if(this._input.style.display == 'none')	//on first click show _input only
			this.maximize();
		else
		{
			if(this._input.value=='')	//hide _input only
				this.minimize();
			else
			{
				if( this._findLocation(this._input.value) )	//location founded!!
					this.minimize();
				else
					this.showAlert( this.options.textErr );//location not found, alert!
			}
		}
		//this.autoMinimizeStop();//maybe unuseful!
	},
	
	_animateLocation: function(latlng) {
		var circle = new L.CircleMarker(latlng, {radius: 20, weight:3, color: '#e03', fill: false}),
			tt = 100,
			ss = 10,
			mr = circle._radius/ss
			f = 0;
		
		circle.addTo(this._map);

		var	that = this;
		this.timerAnimLoc = setInterval(function() {  //animation
			f += 0.5;
			mr += f;//adding acceleration
			var nr = circle._radius - mr;
			if( nr > 2)
				circle.setRadius(nr);
			else
			{
				that._map.removeLayer(circle);
				clearInterval(that.timerAnimLoc);
			}
		}, tt);
	},
	
	_findLocation: function(text) {	//get location from table _recordsCache and pan to location
	
		if( this._recordsCache.hasOwnProperty(text) )
		{
			var latlng = this._recordsCache[text],//serach in table key,value
				z = this.options.zoom || this._map.getZoom();
			this._map.setView(latlng, z);
			if(this.options.animatePan)
				this._animateLocation(latlng);//evidence location
			//TODO start animation after setView panning end
			return latlng;
		}
		else
			return false;
	}

});

