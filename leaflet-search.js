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
		zoom: false	//zoom after pan to location found, default: map.getZoom()
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
		this.timersTime = 1200;//delay for autoclosing
	},

	onAdd: function (map) {
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-search');
		this._input = this._createInput(this.options.text, 'search-input');
		this._createButton(this.options.text, 'search-button');
		this._alert = this._createAlert('search-alert');
		this._tooltip = this._createTooltip('search-tooltip');		
		return this._container;
	},

	onRemove: function(map) {
		delete this._recordsCache;//free memory
	},
	
	alertSearch: function(text) {
		this.hideTooltip();
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		},this.timersTime);
	},
	
	showTooltip: function() {//must be before of _createButton
		this._tooltip.style.display = 'block';
	},
	
	hideTooltip: function() {
		this._tooltip.style.display = 'none';
	},
	
	maximize: function() {//must be before of _createButton
		this._input.style.display = 'block';
		this._input.focus();
	},
	
	minimize: function() {
		this.hideTooltip();
		this._input.blur();	
		this._input.value ='';
		this._input.size = this._inputMinSize;
		this._alert.style.display = 'none';
		this._input.style.display = 'none';
	},

	_createTip: function(text, latlng) {//make record(tag a) insert into tooltip
		var rec = L.DomUtil.create('a', 'search-tip', this._tooltip);
			rec.href = '#',
			rec.innerHTML = text;

		L.DomEvent
			.disableClickPropagation(rec)
			.addListener(rec, 'click', function(e) {
				this._input.value = text;
				if(this.options.autoPan===false)
				{
					this._inputAutoresize();
					this._input.focus();
					this.hideTooltip();
					clearTimeout(this.timerMinimize);//block this._input blur!
				}
				else
					this._findLocation();
			},this);

		return rec;
	},
	
	_fillTooltip: function(items) {//fill tooltip with links
		this._tooltip.innerHTML = '';
		if(items.length)
		{
			for(i in items)
				this._createTip(items[i][0], items[i][1]);
			this.showTooltip();
		}
		else
			this.hideTooltip();
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
			.addListener(input, 'keyup', this._inputAutoresize, this)	
			.addListener(input, 'keyup', this._filterRecords, this)
			.addListener(input, 'blur', function() {
				var that = this;
				this.timerMinimize = setTimeout(function() {
					that.minimize();
				}, this.timersTime);
			},this);
		return input;
	},
	
	_inputAutoresize: function() {	//autoresize this._input
		this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},
	
	_createButton: function (text, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'click', function() {			
				this._findLocation();
				clearTimeout(this.timerMinimize);//block this._input blur!
			}, this);
				
		return button;
	},
	
	_createTooltip: function(className) {
		return L.DomUtil.create('div', className, this._container);
	},
	
	_createAlert: function(className) {
		var alert = L.DomUtil.create('div', className, this._container);
		alert.innerHTML = '&nbsp;';
		alert.style.display = 'none';
		return alert;
	},
	
	_findLocation: function() {	//pan to location if founded
		
		if(this._input.style.display == 'none')
		{
			this.maximize();
		}
		else
		{
			if(this._input.value=='')
				this.minimize();
			else
			{
				var latlng = this._recordsCache[this._input.value];
				if(latlng)
				{
					//this._map.panTo(latlng);
					var z = this.options.zoom || this._map.getZoom();
					this._map.setView(latlng, z);
					this.minimize();
				}
				else
					this.alertSearch( this.options.textErr );
			}
		}
	},

	_updateRecords: function() {	//fill this._recordsCache with all values: text,latlng
		
		this._recordsCache = {};
		
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
	},
	
	_filterRecords: function(e) {	//filter this._recordsCache with this._input.value

		if(e.keyCode==27)//Esc
			this.minimize();
		else if(e.keyCode==13)//Enter
			this._findLocation();
		
		//TODO ajax request for fill this._recordsCache

		if(!this._recordsCache)		//initialize records			
			this._updateRecords();//create table key,value

		var inputText = this._input.value,
			I = this.options.initial ? '^' : '',  //search for initial text
			reg = new RegExp(I + inputText,'i'),
			records = this._recordsCache,
			results = [];		

		if(inputText.length)
		{
			for(text in records)
			{
				if(reg.test(text))//filter
					results.push( [text, records[text] ]);// [key,value]
			}
		}
		this._fillTooltip(results);
	}

});

