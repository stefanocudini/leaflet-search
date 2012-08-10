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
		this.timersTime = 1200;//delay for autoclosing
		this._recordsCache = null;//key,value table! that store locations!
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
		this._hideTooltip();
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		},this.timersTime);
	},
	
	maximize: function() {
		this._input.style.display = 'block';
		this._input.focus();
	},
	
	minimize: function() {
		this._hideTooltip();
		this._input.blur();	
		this._input.value ='';
		this._input.size = this._inputMinSize;
		this._alert.style.display = 'none';
		this._input.style.display = 'none';
	},
	
	minimizeSlow: function() {	//minimize after delay, used on_input blur
		var that = this;
		this.timerMinimize = setTimeout(function() {
			that.minimize();
		}, this.timersTime);
	},

	minimizeSlowStop: function() {
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
			.addListener(input, 'blur', this.minimizeSlow, this)
			.addListener(input, 'focus', this.minimizeSlowStop, this);
			
		return input;
	},

	_createButton: function (text, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'click', this._handleSubmit, this)
			.addListener(button, 'focus', this.minimizeSlowStop, this)
			.addListener(button, 'blur', this.minimizeSlow, this);

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

		var I = this.options.initialSearch ? '^' : '',  //search for initial text
			reg = new RegExp(I + text,'i'),
			records = this._recordsCache,
			results = 0;

		this._tooltip.innerHTML = '';
		
		if(text.length)
		{
			for(key in records)
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
		}
		return results;
	},

	_hideTooltip: function() {
		this._tooltip.style.display = 'none';
		this._tooltip.innerHTML = '';
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
//			case 38: //Up
//			break;
//			case 40: //Down
//			break;
//TODO scroll tips
			case 37://Left
			case 39://Right
			case 16://Shift
			case 17://Ctrl
			//case 32://Space
			break;
			default://All keys
				if(!this._recordsCache)		//initialize records, first time, or always for jsonp search
					this._updateRecords();	//fill table key,value
				
				this._showTooltip(this._input.value);//show tooltip with filter records by this._input.value			
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
		this.minimizeSlowStop();
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
		
	_requestJsonp: function(url, cb) {
		L.Control.Search.callJsonp = function(data) {
			return cb(data);
		}
		var el = L.DomUtil.create('script','', document.getElementsByTagName('body')[0] ),
			delim = url.indexOf('?') >= 0 ? '&' : '?';
		el.type = 'text/javascript';
		el.src = "" + url + delim +"callback=L.Control.Search.callJsonp";
	},	
	
	_findLocation: function(text) {	//get location in table _recordsCache and pan to location if founded
				
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
	},

	_updateRecords: function() {	//update this._recordsCache with simple table: key,value
		
		this._recordsCache = {};

//TODO delay after each keydown!!
//		this._requestJsonp('autocomplete.php?q='+this._input.value, function(json) {
//			console.log(json);
//			return json.results;
//			//TODO convert coord in L.LatLng object!!
//			this._recordsCache = json.results;
//		});

		var markers = this.options.layerSearch._layers,
			propFilter = this.options.propFilter;
		
		this.options.layerSearch.eachLayer(function(marker) {
			var id = marker._leaflet_id,
				text = marker.options.hasOwnProperty(propFilter) && marker.options[propFilter] || '';
			if(text)
				this._recordsCache[text]= marker.getLatLng();
		},this);

		return this._recordsCache;
	}

});

