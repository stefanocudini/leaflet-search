
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
		position: "topleft",
		layer: new L.LayerGroup(),	//layer where search elements
		text: "Search...",	//placeholder value
		propFilter: 'title',	//property of elements filtered by _findElements()
		initial: true
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._records = this.options.layer._layers;//list of searched elements(markers)
		this._tooltip = '';
		this._inputSize = this.options.text.length;
	},

	onAdd: function (map) {

		this._map = map;
		
		this._container = L.DomUtil.create('div', 'leaflet-control-search');

		this._tooltip = this._createTooltip('search-tooltip', this._container);
		this._input = this._createInput(this.options.text, 'search-input', this._container);
		this._createButton(this.options.text, 'search-button', this._container);
		
		//map.on("layeradd layerremove", this._updateSearchList, this);
		
		return this._container;
	},
	
	showTooltip: function() {//must be before of _createButton
		this._input.focus();
		this._tooltip.style.display = 'block';
	},
	
	hideTooltip: function() {
		this._input.blur();	
		this._input.value ='';	
		this._input.size = this._inputSize;
		this._tooltip.style.display = 'none';
	},
	
	showInput: function() {//must be before of _createButton
		this._input.focus();
		this._input.style.display = 'block';
	},
	
	hideInput: function() {
		this._input.blur();	
		this._input.value ='';
		this._input.size = this._inputSize;
		this._input.style.display = 'none';
	},
	_switchInput: function() {
		if(this._input.style.display == 'none')
			this.showInput();
		else
			this.hideInput();
	},
	
	_createRecord: function(text, latlng, container) {//make record(tag a) insert into tooltip
		var rec = L.DomUtil.create('a', 'search-record', container);
			rec.href='#',
			rec.innerHTML = text;

		//console.log(this._map);
			
		L.DomEvent
			.disableClickPropagation(rec)
			.addListener(rec, 'click', function(e) {
				this._map.panTo(latlng);
			},this);

		return rec;
	},
	
	_fillTooltip: function(items) {//array values
		if(items.length==0) return false;
		this._tooltip.innerHTML = '';
		for(i in items)
			this._createRecord(items[i][0], items[i][1], this._tooltip);
	},
	
	_createInput: function (text, className, container) {
		var input = L.DomUtil.create('input', className, container);
		input.type = 'text';
		input.size = this._inputSize,
		input.value = '';
		input.placeholder = text;
		input.style.display = 'none';
		
		
		L.DomEvent
			.disableClickPropagation(input)
			//.addListener(input, 'click', this._findElements,this)
			.addListener(input, 'keyup', this._findElements,this)
			.addListener(input, 'blur', function() {
				var that = this;
				setTimeout(function() {
					that.hideTooltip();
					that.hideInput();
				},200);
			},this);

		return input;
	},
	
	_createButton: function (text, className, container) {
		var button = L.DomUtil.create('a', className, container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'click', this._switchInput,this);

		return button;
	},
	
	_createTooltip: function(className, container) {
		var tooltip = L.DomUtil.create('div', className, container);
		//bind events
		return tooltip;
	},
	
	_findElements: function() {
	
		var text = this._input.value;

		this._input.size = text.length<this._inputSize ? this._inputSize : text.length;
	
		var I = this.options.initial ? '^' : '',//initial with text
			reg = new RegExp(I + text,'i'),
			markers = this._records,//all elements
			vals = [];//matched vals for fill tooltip

		for(id in markers)
		{
			var marker = markers[id],
				found = reg.test(marker.options[this.options.propFilter]);
			
			if(text.length==0 || (marker.options && marker.options.title && found) )
				vals.push( [marker.options.title, marker.getLatLng()] );
		};
		this.showTooltip();
		this._fillTooltip(vals);
	
	}

});

