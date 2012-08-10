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
		position: 'topleft',
		layer: new L.LayerGroup(),	//layer where search elements, default: empty layer
		text: 'Search...',	//placeholder value
		textErr: 'Location not found',
		propFilter: 'title',	//property of elements filtered
		initial: true,
		autoPan: false,  //auto panTo when click on tooltip
		animatePan: true,	//animation after panTo
		zoom: 10	//zoom after pan to location found, default: map.getZoom()
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

	minimizeSlowStop: function() {	//
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
			.addListener(input, 'keyup', this._handleKeydown, this)
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
				this._hideTooltip();
				if(this.options.autoPan)//go to location
				{
					this.minimize();
					this._findLocation(text);
				}
				else	//only set _input value
				{
					this._handleAutoresize();
					this._input.focus();
				}					
			}, this);

		return tip;
	},	
	//////end DOM creations

	_showTooltip: function(text) {	//show tooltip with filtered this._recordsCache

		var I = this.options.initial ? '^' : '',  //search for initial text
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
		
	_handleKeydown: function (e) {
		if(e.keyCode == 27)//Esc
			this.minimize();
		else if(e.keyCode == 13)//Enter
			this._handleSubmit();//do search
		//shortcuts!
				
		if(!this._recordsCache)		//initialize records, first time, or always for jsonp search
			this._updateRecords();	//create table key,value
		
		this._showTooltip(this._input.value);//show tooltip with filter records by this._input.value
	},
	
	_handleAutoresize: function() {	//autoresize this._input
		this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
		//TODO add option autoresize
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
		var circle = new L.CircleMarker(latlng, {radius: 40, color: '#e03', fill: false});
		circle.addTo(map);
		
		var tt = 100,
			ss = 20,
			mr = circle._radius/ss
			f = 0;

		var ii = setInterval(function() {  //animation
			mr += f++;//adding acceleration
			if(circle._radius-mr > 5)
				circle.setRadius(circle._radius-mr);
			else
			{
				map.removeLayer(circle);
				clearInterval(ii);
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
			if(this.options.animatePan)
				this._animateLocation(latlng);//evidence location
			this._map.setView(latlng, z);
			return latlng;
		}
		else
			return false;
	},

	_updateRecords: function() {	//update this._recordsCache with simple table: key,value
		
		this._recordsCache = {};

//TODO delay after each keyKeydown!!
//		this._requestJsonp('autocomplete.php?q='+this._input.value, function(json) {
//			console.log(json);
//			return json.results;
//			this._recordsCache = json.results;
//		});
				
		var markers = this.options.layer._layers,
			propFilter = this.options.propFilter;

		this.options.layer.eachLayer(function(marker) {
		//console.log(marker);
			var id = marker._leaflet_id,
				text = marker.options.hasOwnProperty(propFilter) && marker.options[propFilter] || '';
			if(text)
				this._recordsCache[text]= marker.getLatLng();
		},this);

		return this._recordsCache;
	}

});

