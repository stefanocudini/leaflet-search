/*
 * Leaflet Search Plugin 1.1.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search
 *
 * Copyright 2012, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 */

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events, 
	
	options: {
		searchCall: null,		//callback for resetting _recordsCache, on _handleKeypress
		searchProp: 'title',	//property trough filter elements
		searchJsonpUrl: '',		//url for search by jsonp service, ex: "search.php?q={s}&callback={c}"
		//searchCallFilter: this._filterRecords,	//callback for filtering data to _recordsCache
		searchLayer: null,	//layer where search elements
		searchInitial: true,	//search text by initial
		autoPan: true,  		//auto panTo when click on tooltip
		autoResize: true,		//autoresize on input change
		animatePan: true,		//animation after panTo		
		zoom: null,				//zoom after pan to location found, default: map.getZoom()
		position: 'topleft',
		text: 'Search...',	//placeholder value
		textErr: 'Location not found'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
		this.options.searchLayer = this.options.searchLayer || new L.LayerGroup();
		this.timeAutoclose = 1200;		//delay for autoclosing alert and minimize after blur
		this.timeKeypress = 300;	//delay after keypress into _input
		this._recordsCache = {};	//key,value table! that store locations!
	},

	onAdd: function (map) {
		this._map = map;
		this._circleLoc = (new L.CircleMarker([0,0], {radius: 20, weight:3, color: '#e03', fill: false})).addTo(this._map);
		this._container = L.DomUtil.create('div', 'leaflet-control-search');					
		this._alert = this._createAlert('search-alert');		
		this._input = this._createInput(this.options.text, 'search-input');
		this._createButton(this.options.text, 'search-button');
		this._tooltip = this._createTooltip('search-tooltip');
		//var that = this; map.on('mousedown',function(e) { that._animateLocation(e.latlng); });
		//uncomment for fast test of _animateLocation()
		return this._container;
	},

	onRemove: function(map) {
		this._recordsCache = {};//free memory!...?
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
		this._circleLoc.setLatLng([0,0]);
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
	
	_clickFocus : function(e) {
		e.target.focus();
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
			.addListener(input, 'keyup', this._handleKeypress, this)
			.addListener(input, 'keyup', this._handleAutoresize, this)			
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
			.addListener(button, 'focus', this.autoMinimizeStop, this)
			.addListener(button, 'blur', this.autoMinimize, this)
			.addListener(button, 'click', this._handleSubmit, this);

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

		var regFilter = new RegExp("^[.]$|[|]",'g'),	//remove . and | 
			text = text.replace(regFilter,''),		//sanitize text
			I = this.options.searchInitial ? '^' : '',  //search for initial text
			regSearch = new RegExp(I + text,'i'),	//for search in _recordsCache
			results = 0;
					
		if(text.length<1)	//TODO add tooltip min length
		{
			this._hideTooltip();
			return false;
		}

		this._tooltip.innerHTML = '';
		
		for(key in this._recordsCache)
		{
			if(regSearch.test(key))//search in records
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

	_recordsFromJsonp: function(text, callFilter, callAfter, context) {

		L.Control.Search.callJsonp = function(data) {
			context._recordsCache = callFilter(data);
			callAfter();//usually _showTooltip
		}
		var el = L.DomUtil.create('script','', document.getElementsByTagName('body')[0] ),
			url = L.Util.template(context.options.searchJsonpUrl, {s: text, c:"L.Control.Search.callJsonp"});
			rnd = '&_='+Math.floor(Math.random()*10000);  //random param for disable browser cache
		el.type = 'text/javascript';
		el.src = url;	//TODO add rnd param
	},

	_filterRecords: function(jsonraw) {	//default callback for filter data from jsonp/ajax to _recordsCache format(key,latlng)
	//TODO move this function to example
		//console.log(jsonraw);
		var jsonret = {};
		for(i in jsonraw.results)
			jsonret[ jsonraw.results[i].title ]= L.latLng( jsonraw.results[i].loc );
		//console.log(jsonret);
		return jsonret;
	},

	_recordsFromLayer: function(layerSearch, propSearch) {	//return table: key,value from layer
		var retRecords = {};
		layerSearch.eachLayer(function(marker) {	//iterate elements in layer
		//TODO filter by element type: marker|polyline|circle...
			var key = marker.options.hasOwnProperty(propSearch) && marker.options[propSearch] || '';
			if(key)
				retRecords[key] = marker.getLatLng();
		},this);
		//TODO make cache for results while layerSearch not change, control on 'load' event
		return retRecords;
	},

	_handleKeypress: function (e) {//_input keyup
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
				
					var text = that._input.value;

					//TODO move this anonymous function inside new specific function for select which callback run	
					if(that.options.searchCall)	//personal search callback(usually for ajax searching)
					{
						that._recordsCache = that.options.searchCall(text);
						that._showTooltip(text);
					}
					else if(that.options.searchJsonpUrl)
					{
						that._recordsFromJsonp(that._input.value, function(jsonraw) { //callFilter
								return that._filterRecords(jsonraw);
								//TODO replace with that.options.searchCallFilter
							}, function() {											  //callAfter
								that._showTooltip(text);
							}, that);												  //context
					}
					else if(that.options.searchLayer)
					{
						//TODO update _recordsCache only one
						that._recordsCache = that._recordsFromLayer(that.options.searchLayer, that.options.searchProp);	//fill table key,value from markers into searchLayer				
						that._showTooltip(text);	//show tooltip with filter records by this._input.value			
					}

				}, that.timeKeypress);
		}
	},	
	
	_handleAutoresize: function() {	//autoresize this._input
		if(this.options.autoResize)
			this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},
	
	_handleSubmit: function(e) {	//search button action, and enter key shortcut
	
		if(this._input.style.display == 'none')	//on first click show _input only
			this.maximize();
		else
		{
			if(this._input.value=='')	//hide _input only
				this.minimize();
			else
			{
				if( this._findLocation(this._input.value)===false )	//location founded!!
					this.showAlert( this.options.textErr );//location not found, alert!
				//else
				//	this.minimize();
			}
		}
		this._input.focus();	//block autoMinimize after _button blur
	},
	
	_animateLocation: function(latlng) {
	
		var circle = this._circleLoc;
		circle.setLatLng(latlng);
		circle.setRadius(20);
	
		var	tt = 200,
			ss = 10,
			mr = parseInt(circle._radius/ss),
			f = 0;
		var	that = this;
		this.timerAnimLoc = setInterval(function() {  //animation
			f += 0.5;
			mr += f;//adding acceleration
			var nr = circle._radius - mr;
			if( nr > 2)
				circle.setRadius(nr);
			else
				clearInterval(that.timerAnimLoc);
		}, tt);
	},
	
	_findLocation: function(text) {	//get location from table _recordsCache and pan to map! ...game over!
	
		if( this._recordsCache.hasOwnProperty(text) )
		{
			var newCenter = this._recordsCache[text];//serach in table key,value
			
			if(this.options.zoom)
				this._map.setView(newCenter, this.options.zoom);
			else
				this._map.panTo(newCenter);
				
			if(this.options.animatePan)
				this._animateLocation(newCenter);//evidence location found
			//TODO start animation after setView panning end, maybe on moveend
			return newCenter;
		}
		else
			this._circleLoc.setLatLng([0,0]);	//hide evidence
		
		return false;
	}

});
