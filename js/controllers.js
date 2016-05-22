var controllerApp = angular.module('bdoApp.controllers', []);
controllerApp.config(function($httpProvider) {
	$httpProvider.defaults.headers.common = {};
	$httpProvider.defaults.headers.post = {};
	$httpProvider.defaults.headers.put = {};
	$httpProvider.defaults.headers.patch = {};
	$httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
}); // TODO

controllerApp.controller('AppController', function($scope, EntityService, TypeService) {
	$scope.entities = [];	
	EntityService.query({'ajaxId':'entities'}, function(data) {
		$scope.entities = data;
	});

	$scope.types = [];	
	TypeService.query({'ajaxId':'types'}, function(data) {
		$scope.types = data;
	});
});

controllerApp.controller('MapController', function($scope, EntityService) {
	var LeafIcon = L.Icon.extend({
	    options: {
	        iconSize: [47, 37],
	        iconAnchor: [25, 45],
	        popupAnchor: [0, -47]
	    }
	});
	
	/* To determine the location of the popup on a polygon */
	var polygonPopupLocation = function(latlngs) {
	    var maxLat, sumLng = 0;
	    $(latlngs).each(function() {
	    	if (!maxLat || this.lat > maxLat)
	            maxLat = this.lat;
	        sumLng += this.lng;
	    });
	    return new L.LatLng(maxLat, sumLng / latlngs.length);
	}

	map = L.map('map').setView([-70, 0], 3);
	map.fitBounds(new L.LatLngBounds(map.unproject([0, 16384], 6), map.unproject([16384, 8602], 6)));
	map.addLayer(L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
	    minZoom: 2,
	    maxZoom: 6,
	    attribution: 'Aequitas Black Desert Map',
	    tms: true,
	    continuousWorld: true,
	    noWarp: true
	}));
	
	var addEntity = function(index, entity) {
		$(entity.markers).each(function() {
			var marker = this;
			var mapMarker = L.marker([marker.latitude, marker.longitude], { icon: new LeafIcon({ iconUrl: marker.icon.url }) });
			mapMarker.addTo(map);
			mapMarker.entity = entity;
			mapMarker.marker = marker;
			mapMarker.bindPopup(entity.title);
			$(mapMarker).hover(function() { this.openPopup(); } , function(){this.closePopup();} );
			mapLayers.push(mapMarker);
		});
		$(entity.circles).each(function() {
			var circle = this;
			var mapCircle = L.circle([circle.latitude, circle.longitude], circle.radius, {
		        color: circle.outlineColor,
		        fillColor: circle.fillColor,
		        fillOpacity: 0.5
		    });
			mapCircle.addTo(map);
			mapCircle.entity = entity;
			mapCircle.circle = circle;
			mapCircle.bindPopup(entity.title);
			$(mapCircle).hover(function() { this.openPopup(); } , function(){this.closePopup();} );
			mapLayers.push(mapCircle);
		});
		$(entity.polygons).each(function() {
			var polygon = this;
			polygon.vertexArray = JSON.parse(polygon.vertices);
			var mapPolygon = L.polygon(polygon.vertexArray, {
				color: polygon.outlineColor, 
				fillColor: polygon.fillColor
			});
			mapPolygon.addTo(map);
			mapPolygon.entity = entity;
			mapPolygon.polygon = polygon;
			mapPolygon.bindPopup(entity.title);
			$(mapPolygon).hover(function() { this.openPopup(polygonPopupLocation(this._latlngs)); } , function(){ this.closePopup(); } );
			mapLayers.push(mapPolygon);
		});
	};

	var mapLayers = [];
	$($scope.entities).each(addEntity);
	map.mapLayers = mapLayers;
	var mapLayersMap = new Map();
	$(mapLayers).each(function() {
		mapLayersMap.set(this.entity.id, this);
	});
	map.mapLayersMap = mapLayersMap;

	/* Draw Controls */
	var drawnItems = new L.FeatureGroup().addTo(map);
	var drawControl = new L.Control.Draw({
//	    edit: {
//	        featureGroup: drawnItems
//	    }
	}).addTo(map);
	map.on('draw:created', function (e) {
	    var type = e.layerType;
	    var layer = e.layer;

	    var entity = new EntityService();
	    entity.title = 'New Entity';
	    entity.types = [];
	    entity.circles = [];
	    entity.markers = [];
	    entity.polygons = [];
	    entity.notes = [];
	    entity.images = [];

	    if (type === 'marker') {
	        var marker = {};
	        marker.latitude = layer._latlng.lat;
	        marker.longitude = layer._latlng.lng;
	        marker.iconId = ''; // TODO - IconId
	        entity.markers.push(marker);
	    } else if (type === 'circle') {
	    	var circle = {};
	    	circle.latitude = layer._latlng.lat;
	    	circle.longitude = layer._latlng.lng;
	    	circle.radius = 11000;
	    	circle.outlineColor = 'red';
	    	circle.fillColor = 'red';
	    	entity.circles.push(circle);
	    } else if (type === 'polygon') {
	    	var polygon = {};
	    	polygon.vertices = _layer.latlngs;
	    	polygon.outlineColor = 'green';
	    	polygon.fillColor = 'green';
	    	entity.polygons.push(polygon);
	    } else {
	    	// ??
	    }
	    
	    var note = {};
	    note.note = 'A note!';
	    entity.notes.push(note);

	    var img = {};
	    img.url = 'http://url.url/url.jpg';
	    entity.images.push(img);

	    entity.$save({'ajaxId':'saveEntity'}, function(savedEntity) {
	    	addEntity(0, savedEntity);
	    });
	    //sidebar.open('info');

	    // Do whatever else you need to. (save to db, add to map etc)
	    map.addLayer(layer);
	});
});

controllerApp.controller('SidebarController', function($scope) {
	sidebar = L.control.sidebar('sidebar', {
		position: "right"
	}).addTo(map);

	/* Hide other sidebar items and show the clicked coordinates */
	var showCoordinates = function(e) {
	    $('#info-coordinates').addClass('hidden');
	    $('#info-node').addClass('hidden');
	    $('#info .sidebar-header').children().first().text('Coordinates [Lat, Long]');
	    $('#info-coordinates .coord-data').html('[' + e.latlng.lat + ', ' + e.latlng.lng + ']');
	    $('#info-coordinates').removeClass('hidden');
	    sidebar.open('info');
	}
	map.on('click', showCoordinates);

	/* Visibility: Create an all layers filter */
	$('#layer-all').click(function() {
	    var allLayersActive = $('#layer-all').hasClass('active');
	    $(map.mapLayers).each(function() {
	        allLayersActive ? map.removeLayer(this) : map.addLayer(this);
	    });
	    $('#layer-content .sidebar-layer').each(function() {
	    	$(this).removeClass(allLayersActive ? 'active' : 'inactive');
	    	$(this).addClass(allLayersActive ? 'inactive' : 'active');
		});
	});

	/* Visibility: Create an entry for each type */
	$($scope.types).each(function() {
		var type = this;
		var $sidebarDiv = $('<div id="layer-' + type.id + '" class="sidebar-layer active"></div>');
	    $sidebarDiv.append($('<p>' + type.name + '</p>'));
	    $sidebarDiv.click(function() {
	        var active = $('#layer-' + type.id).hasClass('active');
	        $(map.mapLayers).each(function() {
	        	var mapLayer = this;
	        	$(this.entity.types).each(function() {
	        		entityType = this;
	        		if (entityType.id == type.id) {
	        			active ? map.removeLayer(mapLayer) : map.addLayer(mapLayer);
	        		}
	        	});
	        });
	        $(this).removeClass(active ? 'active' : 'inactive');
	    	$(this).addClass(active ? 'inactive' : 'active');
	    });
	    $("#layer-content").append($sidebarDiv);
	});
	
	/* Search: Create a search entry for each map layer */
	$(map.mapLayers).each(function() {
		if (this.marker) {
			$(this.marker).click(function() {
				$('#info-coordinates').addClass('hidden');
			    $('#info-node').addClass('hidden');
			    $('#info .sidebar-header').children().first().text(headerText);
			    $('#info-node .node-name').text(this.entity.title);
			    if (this.entity.notes) {
			    	mapLayer.entity.notes.each(function() {
			    		$('#info-node .node-notes').append('<p>' + this + '</p>');
			    	});
			    }
			    $('info-node .node-coordinates').text('[' + this.marker.latitude + ', ' + this.marker.longitude + ']');
			    if (this.marker.icon && this.marker.icon.url) {
			    	$('#info-node .node-img').html('<a href="' + this.marker.icon.url + '"><img src="' + this.marker.icon.url + '" width="300px"></img></a>');
			    }
			    $('#info-node').removeClass('hidden');
			    sidebar.open('info');
			});
		}
		if (this.polygon) {
			this.on('click', showCoordinates);
		}
	});
	
	/* For toggling search items to show or not when clicked */
	$scope.toggle = function(id) {
		$('#' + id).toggle();
		
		var caret = $('[for=' + id + '] > span > i');
		var display = $('#' + id).css('display') == 'none';
		caret.removeClass(display ? 'fa-caret-down' : 'fa-caret-right');
		caret.addClass(display ? 'fa-caret-right' : 'fa-caret-down');
	}
	
	/* Search: Hide/Show layers based on search filter */
	var observer = new MutationObserver(function(mutations) {
		$(mutations).each(function() {
			$(this.addedNodes).each(function() {
				if ($(this).hasClass('search-result')) {
		    		map.addLayer(map.mapLayersMap.get($(this).attr('id')));
				}
			});
			$(this.removedNodes).each(function() {
				if ($(this).hasClass('search-result')) {
					map.removeLayer(map.mapLayersMap.get($(this).attr('id')));
				}
			});
		});
	});

	setTimeout(function() {
		observer.observe(document.getElementById("search-list"), {
			childList: true,
			attributes: false,
			characterData: false,
			subtree: false,
			attributeOldValue: false,
			characterDataOldValue: false
		});
	}, 1000);
});