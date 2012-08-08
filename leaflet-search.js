/*
 * Leaflet Search Plugin 1.0.0
 * https://github.com/stefanocudini/leaflet-search
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
		propFilter: 'title',	//property of elements filtered
		initial: true
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
	},

	onAdd: function (map) {
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-search');
		this._tooltip = this._createTooltip('search-tooltip', this._container);
		this._input = this._createInput(this.options.text, 'search-input', this._container);
		this._createButton(this.options.text, 'search-button', this._container);
		return this._container;
	},

	onRemove: function(map) {
		delete this._recordsCache;//free memory
	},

	showTooltip: function() {//must be before of _createButton
		this._input.focus();
		this._tooltip.style.display = 'block';
	},
	
	hideTooltip: function() {
//		this._input.blur();
		this._tooltip.style.display = 'none';
	},
	
	showInput: function() {//must be before of _createButton
		this._input.style.display = 'block';
		this._input.focus();
	},
	
	hideInput: function() {
		this.hideTooltip();
		this._input.blur();	
		this._input.value ='';
		this._input.size = this._inputMinSize;
		this._input.style.display = 'none';
	},
	
//	_switchInput: function() {
//		if(this._input.style.display == 'none')
//			this.showInput();
//		else
//			this.hideInput();
//	},
	
	_createRecord: function(text, latlng, container) {//make record(tag a) insert into tooltip
		var rec = L.DomUtil.create('a', 'search-record', container);
			rec.href = '#',
			rec.innerHTML = text;

		L.DomEvent
			.disableClickPropagation(rec)
			.addListener(rec, 'click', function(e) {
				//this._map.panTo(latlng);
				this._input.value = text;
				this._input.focus();
				this.hideTooltip();
			},this);

		return rec;
	},
	
	_fillTooltip: function(items) {//fill tooltip with links
		this._tooltip.innerHTML = '';
		if(items.length)
		{
			for(i in items)
				this._createRecord(items[i][0], items[i][1], this._tooltip);
			this.showTooltip();
		}
		else
			this.hideTooltip();
	},
	
	_createInput: function (text, className, container) {
		var input = L.DomUtil.create('input', className, container);
		input.type = 'text';
		input.size = this._inputMinSize,
		input.value = '';
		input.placeholder = text;
		input.style.display = 'none';
		
		L.DomEvent
			.disableClickPropagation(input)
			.addListener(input, 'keyup', this._inputAutoresize, this)	
			.addListener(input, 'keyup', this._filterRecords, this)
//			.addListener(input, 'blur', function() {
//				var that = this;
//				setTimeout(function() {
//					that.hideTooltip();
//					that.hideInput();
//				},200);
//			},this);
		return input;
	},
	
	_inputAutoresize: function() {	//autoresize this._input
		this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},
	
	_createButton: function (text, className, container) {
		var button = L.DomUtil.create('a', className, container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'click', this._findLocation, this);

		return button;
	},
	
	_createTooltip: function(className, container) {
		return L.DomUtil.create('div', className, container);
	},
	
//	alertSearch: function(text) {
//		return L.DomUtil.create('div', className, container);
//	},
	
	_findLocation: function() {	//go to location found
		
		if(this._input.style.display == 'none')
		{
			this.showInput();
		}
		else
		{
			if(this._input.value)
			{
				var latlng = this._recordsCache[this._input.value];
				if(latlng)
					this._map.panTo(latlng);
				else
					alert('location not found');
			}
		
			this.hideInput();
		}
	},
		
	_updateRecords: function() {	//fill this._recordsCache with all values: text,latlng
			
		var markers = this.options.layer._layers,
			propFilter = this.options.propFilter,
			vals = {};

		this.options.layer.eachLayer(function(marker) {
			var text = marker.options[propFilter] || '';
			vals[text]= marker.getLatLng();
		},this);

		return vals;
	},
	
	_filterRecords: function() {	//filter this._recordsCache with this._input.value

		if(!this._recordsCache)		//initialize records
			this._recordsCache = this._updateRecords();//create table text,latlng

		var inputText = this._input.value,
			I = this.options.initial ? '^' : '',  //search for initial text
			reg = new RegExp(I + inputText,'i'),
			records = this._recordsCache,
			results = [];		

		if(inputText.length)
		{
			for(text in records)
			{
				var latlng = records[text],
					found = reg.test(text);

				if(found)//filter
					results.push([text,latlng]);
			}
		}
		this._fillTooltip(results);
	}

});

