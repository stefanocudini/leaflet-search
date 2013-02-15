/*
 * Leaflet Search Control 1.2.0
 * https://github.com/stefanocudini/leaflet-search
 * https://bitbucket.org/zakis_/leaflet-search
 * http://labs.easyblog.it/maps/leaflet-search
 *
 * Copyright 2012, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 */

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events, 
	
	options: {
		searchCall: null,			//callback that fill _recordsCache with key,value table
		searchJsonpUrl: '',			//url for search by jsonp service, ex: "search.php?q={s}&callback={c}"
		searchJsonpFilter: null,	//callback for filtering data to _recordsCache
		//TODO add options: searchJsonpKey and searchJsonpLoc for remapping fields from jsonp
		searchLayer: null,			//layer where search elements
		searchLayerProp: 'title',	//property in marker.options trough filter elements in layer searchLayer
		searchInitial: true,		//search text in _recordsCache by initial
		searchMinLen: 1,			//minimal text length for autocomplete
		searchDelay: 300,			//delay for searching after digit
		autotype: true,			// Complete input with first suggested result and select this filled-in text.
		//TODO searchLimit: 100,	//limit max results show in tooltip
		autoPan: true,  		//auto panTo when click on tooltip
		autoResize: true,		//autoresize on input change
		animatePan: true,		//animation after panTo
		zoom: null,				//zoom after pan to location found, default: map.getZoom()
		position: 'topleft',
		text: 'Search...',		//placeholder value
		textErr: 'Location not found'	//error message
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._inputMinSize = this.options.text.length;
		this.options.searchLayer = this.options.searchLayer || new L.LayerGroup();
		this.options.searchJsonpFilter = this.options.searchJsonpFilter || this._jsonpDefaultFilter;
		this.timeAutoclose = 1200;		//delay for autoclosing alert and collapse after blur
		this.timeDelaySearch = this.options.searchDelay;
		this._recordsCache = {};	//key,value table! that store locations! format: key,latlng
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
		//TODO bind _recordsFromLayer to map events layeradd layerd remove update ecc
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
	
	expand: function() {		
		this._input.style.display = 'block';
		L.DomUtil.addClass(this._container,'exp');		
		this._input.focus();
	},

	collapse: function() {
		this._hideTooltip();
		this._input.value ='';
		this._input.size = this._inputMinSize;
		this._alert.style.display = 'none';
		this._input.style.display = 'none';
		L.DomUtil.removeClass(this._container,'exp');		
		this._circleLoc.setLatLng([0,0]);
		this._map._container.focus();
	},
	
	autoCollapse: function() {	//collapse after delay, used on_input blur
		var that = this;
		this.timerCollapse = setTimeout(function() {
			that.collapse();
		}, this.timeAutoclose);
	},

	autoCollapseStop: function() {
		clearTimeout(this.timerCollapse);
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
			.addListener(input, 'blur', this.autoCollapse, this)
			.addListener(input, 'focus', this.autoCollapseStop, this);
			
		return input;
	},

	_createButton: function (text, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = text;

		L.DomEvent
			.disableClickPropagation(button)
			.addListener(button, 'focus', this.autoCollapseStop, this)
			.addListener(button, 'blur', this.autoCollapse, this)
			.addListener(button, 'click', this._handleSubmit, this);

		return button;
	},

	_createTooltip: function(className) {
		var tool = L.DomUtil.create('div', className, this._container);
		tool.style.display = 'none';
		var _this = this;
		
		L.DomEvent
			.disableClickPropagation(tool)
			.addListener(tool, 'blur', this.autoCollapse, this)
			.addListener(tool, 'mousewheel', function(e) {
				_this.autoCollapseStop;
				L.DomEvent.stopPropagation(e);
			}, this)
			.addListener(tool, 'mousedown', function(e) {
				L.DomEvent.stop(e);
				_this.autoCollapseStop;
			}, this);
//not work!	:-( try mouseover
		return tool;
	},

	_createTip: function(text) {	//build new choice for tooltip menu
		var tip = L.DomUtil.create('a', 'search-tip');
			tip.href = '#',
			tip.innerHTML = text;

		this._tooltip.currentSelection = -1;

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

	_showTooltip: function(e,prefix) {	//show tooltip with filtered this._recordsCache values

		if(this._input.value.length < this.options.searchMinLen)
			return this._hideTooltip();

		var regFilter = new RegExp("^[.]$|[|]",'g'),	//remove . and | 
			text = prefix.replace(regFilter,''),		//sanitize text
			I = this.options.searchInitial ? '^' : '',  //search for initial text
			regSearch = new RegExp(I + text,'i'),	//for search in _recordsCache
			ntip = 0;	
		
		this._tooltip.innerHTML = '';

		// FIXME: Maybe _recordsCache should be a sorted array.

		for(var key in this._recordsCache)
		{
			if(regSearch.test(key))//search in records
			{
				this._tooltip.appendChild( this._createTip(key) );
				ntip++;
			}
		}
		if(ntip>0) {
			this._tooltip.style.display = 'block';
			this._autotype(e,prefix); // FIXME: Maybe e can eliminated.
		}
		else
			this._hideTooltip();

		this._tooltip.scrollTop = 0;
		return ntip;
	},

	_hideTooltip: function() {
		this._tooltip.style.display = 'none';
		this._tooltip.innerHTML = '';
	},

	_jsonpDefaultFilter: function(jsonraw) {	//default callback for filter data from jsonp to _recordsCache format(key,latlng)
		var jsonret = {};
		for(var i in jsonraw)
			jsonret[ jsonraw[i].title ]= L.latLng( jsonraw[i].loc );
		//TODO replace .title and .loc with options: searchJsonpKey and searchJsonpLoc
		//TODO use: throw new Error("my message");on error
		return jsonret;
	},
	
	_recordsFromJsonp: function(inputText, callAfter, that) {

		L.Control.Search.callJsonp = function(data) {	//jsonp callback
			var fdata = that.options.searchJsonpFilter(data);
			callAfter(fdata);
		}
		var scriptNode = L.DomUtil.create('script','', document.getElementsByTagName('body')[0] ),			
			url = L.Util.template(that.options.searchJsonpUrl, {s: inputText, c:"L.Control.Search.callJsonp"});
			//parsing url
			//rnd = '&_='+Math.floor(Math.random()*10000);//TODO add rnd param or randomize callback name!

		scriptNode.type = 'text/javascript';
		scriptNode.src = url;
		return callAfter;
	},

	_recordsFromLayer: function() {	//return table: key,value from layer
		var retRecords = {},
			layerSearch = this.options.searchLayer,
			propSearch = this.options.searchLayerProp;

		layerSearch.eachLayer(function(marker) {
		//TODO filter by element type: marker|polyline|circle...
			var key = marker.options.hasOwnProperty(propSearch) && marker.options[propSearch] || '';
			//TODO check if propSearch is a string! else use: throw new Error("my message");
			if(key)
				retRecords[key] = marker.getLatLng();
		},this);
		//TODO caching retRecords while layerSearch not change, controlling on 'load' event
		return retRecords;
	},

	_autotype: function(e,prefix) {
		if ((e.keyCode != 8) && (e.keyCode != 46) && this.options.autotype) { // Don't autotype after deleting.
			var start = this._input.value.length;
			var firstRecord = this._tooltip.getElementsByTagName('a')[0].innerHTML; // FIXME: find a way without innerHTML that also guarantees correct order (application developer may want images in tooltip)
			var end = firstRecord.length;
			this._input.value = firstRecord;
			this._handleAutoresize();
			if (this._input.createTextRange) {
				var selRange = this._input.createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end);
				selRange.select();
			}
			else if(this._input.setSelectionRange) {
				this._input.setSelectionRange(start, end);
			}
			else if(this._input.selectionStart) {
				this._input.selectionStart = start;
				this._input.selectionEnd = end;
			}
		}
	},

	_handleKeypress: function (e) {	//run _input keyup event
		switch(e.keyCode)
		{
			case 27: //Esc
				this.collapse();
			break;
			case 13: //Enter
				this._handleSubmit();	//do search
			break;
			case 38://Up
				this._handleArrowSelect(-1);
			break;
			case 40://Down
				this._handleArrowSelect(1);
			break;
			case 37://Left
			case 39://Right
			case 16://Shift
			case 17://Ctrl
			//case 32://Space
			break;
			default://All keys

				clearTimeout(this.timerKeypress);	//cancel last search request

				if(this._input.value.length < this.options.searchMinLen)
					return this._hideTooltip();
				
				var that = this;
				//TODO move anonymous function in setTimeout in new function source selector
				L.DomUtil.addClass(that._input, 'load');	
				this.timerKeypress = setTimeout(function() {	//delay before request, for limit jsonp/ajax request
					var inputText = that._input.value;
				
					if(that.options.searchCall)	//PERSONAL SEARCH CALLBACK(USUALLY FOR AJAX SEARCHING)
					{
						that._recordsCache = that.options.searchCall.apply(that, [inputText]);
						if(that._recordsCache)
							that._showTooltip(e,inputText);
					}
					else if(that.options.searchJsonpUrl)	//JSONP SERVICE REQUESTING
					{
						that._recordsFromJsonp(inputText, function(data) {	//callback run after data return
							that._recordsCache = data;
							that._showTooltip(e,inputText);
						}, that);
					}
					else if(that.options.searchLayer)	//SEARCH ELEMENTS IN PRELOADED LAYER
					{
						that._recordsCache = that._recordsFromLayer();	//fill table key,value from markers into searchLayer				
						that._showTooltip(e,inputText);	//show tooltip with filter records by this._input.value			
					}
					L.DomUtil.removeClass(that._input, 'load');
				}, that.timeDelaySearch);
		}
	},	
	
	// FIXME: Don't autoresize past the size of the map.
	_handleAutoresize: function() {	//autoresize this._input
		if(this.options.autoResize)
			this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},

	_handleArrowSelect: function(velocity) {
		for (i=0; i<this._tooltip.getElementsByTagName('a').length; i++) { // Erase all highlighting
			this._tooltip.getElementsByTagName('a')[i].style.backgroundColor='';
		}
		if ((velocity == 1 ) && (this._tooltip.currentSelection >= (this._tooltip.getElementsByTagName('a').length - 1))) { // If at end of list.
			this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].style.backgroundColor='white';
		}
		else if ((velocity == -1 ) && (this._tooltip.currentSelection <= 0)) { // Going back up to the search box.
			this._tooltip.currentSelection = -1;
		}
		else if (this._tooltip.style.display != 'none') { // regular up/down
			this._tooltip.currentSelection += velocity;
			this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].style.backgroundColor='white';
			this._input.value = this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].innerHTML;

			// scroll:
			var tipOffsetTop = this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].offsetTop;
			if (tipOffsetTop + this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].clientHeight >= this._tooltip.scrollTop + this._tooltip.clientHeight) {
				this._tooltip.scrollTop = tipOffsetTop - this._tooltip.clientHeight + this._tooltip.getElementsByTagName('a')[this._tooltip.currentSelection].clientHeight;
			}
			else if (tipOffsetTop <= this._tooltip.scrollTop) {
				this._tooltip.scrollTop = tipOffsetTop;
			}
		}
	},

	_handleSubmit: function(e) {	//search button action, and enter key shortcut

		// deselect text:
		var sel;
		if ((sel = this._input.selection) && sel.empty) {
			sel.empty();
		}
		else {
			if (this._input.getSelection) {
				this._input.getSelection().removeAllRanges();
			}
			this._input.selectionStart = this._input.selectionEnd;
		}

		if(this._input.style.display == 'none')	//on first click show _input only
			this.expand();
		else
		{
			if(this._input.value=='')	//hide _input only
				this.collapse();
			else
			{
				if( this._findLocation(this._input.value)===false )	//location founded!!
					this.showAlert( this.options.textErr );//location not found, alert!
				//else
				//	this.collapse();
			}
		}
		this._input.focus();	//block autoCollapse after _button blur
	},
	
	_animateLocation: function(latlng) { //TODO rewrite more smooth!
	
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
			var newCenter = this._recordsCache[text];//search in table key,value
			
			if(this.options.zoom)
				this._map.setView(newCenter, this.options.zoom);
			else
				this._map.panTo(newCenter);

			//TODO add option for delay Collapse when found
				
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
