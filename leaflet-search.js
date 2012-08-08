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
		textErr: 'Location not found',
		propFilter: 'title',	//property of elements filtered
		initial: true
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
		this.timersTime = 2000;//delay for autoclosing
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
		this._alert.style.display = 'none';
		this._input.style.display = 'none';
	},

//	_switchInput: function() {
//		if(this._input.style.display == 'none')
//			this.showInput();
//		else
//			this.hideInput();
//	},
	
	_createTip: function(text, latlng) {//make record(tag a) insert into tooltip
		var rec = L.DomUtil.create('a', 'search-tip', this._tooltip);
			rec.href = '#',
			rec.innerHTML = text;

		L.DomEvent
			.disableClickPropagation(rec)
			.addListener(rec, 'click', function(e) {
				//this._map.panTo(latlng);
				this._input.value = text;
				this._input.focus();
				this.hideTooltip();
				clearTimeout(this.timerMinimize);//block this._input blur!
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
					that.hideInput();
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
	
	_findLocation: function() {	//go to location found
		
		if(this._input.style.display == 'none')
		{
			this.showInput();
		}
		else
		{
			if(this._input.value=='')
				this.hideInput();
			else
			{
				var latlng = this._recordsCache[this._input.value];
				if(latlng)
				{
					this._map.panTo(latlng);
					this.hideInput();
				}
				else
					this.alertSearch( this.options.textErr );
			}			
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
	
	_filterRecords: function(e) {	//filter this._recordsCache with this._input.value

		if(e.keyCode==27)//Esc clicked
			this.hideInput();

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

