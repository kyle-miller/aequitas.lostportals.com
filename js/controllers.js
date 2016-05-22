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
<<<<<<< HEAD
	map.addLayer(L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
	    minZoom: 2,
	    maxZoom: 6,
	    attribution: 'Aequitas Black Desert Map',
	    tms: true,
	    continuousWorld: true,
	    noWarp: true
	}));
	
	var addEntity = function(index, entity) {
=======
	L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
		minZoom: 2,
		maxZoom: 6,
		attribution: 'Aequitas Black Desert Map',
		tms: true,
		continuousWorld: true,
		noWarp: true
	}).addTo(map);

	var mapLayers = [];
	$($scope.entities).each(function() {
		var entity = this;
>>>>>>> 2bd400d63b0edea0115ec814b261499683a32bb2
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
<<<<<<< HEAD

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
=======
	
	/* Drawing Controls */
	drawnItems = new L.FeatureGroup().addTo(map);

	drawControl = new L.Control.Draw({
		 position: 'topleft',
		 draw: {
			  polyline: false,
			  polygon: { 
					allowIntersection: false
			  },
			  circle: false,
			  rectangle: false
		 },
		 edit: {
			  featureGroup: drawnItems
		 }
	}).addTo(map);

	map.on('draw:created', function (e) {
		 // Save to spreadsheet
		 drawnItems.addLayer(e.layer);
>>>>>>> 2bd400d63b0edea0115ec814b261499683a32bb2
	});
});

controllerApp.controller('SidebarController', function($scope) {
	sidebar = L.control.sidebar('sidebar', {
<<<<<<< HEAD
		position: "right"
=======
		position: 'right'
>>>>>>> 2bd400d63b0edea0115ec814b261499683a32bb2
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
	        allLayersActive ? map.removeLayer(this) : this.addTo(map);
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
	        			active ? map.removeLayer(mapLayer) : mapLayer.addTo(map);
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
					map.mapLayersMap.get($(this).attr('id')).addTo(map);
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
<<<<<<< HEAD
});
=======
});
	
//	angularApp.controller("SearchController", function($scope) {
//		var createMarker = function(sheetId, sheetName, icon, row) {
//		    var aMarker = L.marker([row.lat, row.lon], { icon: BDO.icons.get(icon) });
//		    aMarker.type = sheetId;
//		    var headerText = sheetName.charAt(sheetName.length - 1) == 's' ? sheetName.substring(0, sheetName.length - 1) : sheetName;
//		    var popupHeader = $('<div class="popup-header">' + row.name + '</div>');
//		    var popupData = $('<div class="popup-data"></div>');
//		    if (row.popupNotes) {
//		        var data = row.popupNotes.split(',');
//		        if (data) {
//		            popupHeader.attr('style', 'border-bottom: 1px solid black; margin-bottom: 5px;');
//		            popupData.text(data);
//		        }
//		    }
//		    var popup = $('<div class="popup"></div>');
//		    popup.append(popupHeader);
//		    popup.append(popupData);
//		    aMarker.bindPopup(popup.html());
//		    var showInfoForMarker = function() {
//		        hideInfoDivs();
//		        $("#info .sidebar-header").children().first().text(headerText);
//		        $("#info-node .node-name").text(row.name);
//		        $("#info-node .node-notes").text(row.notes);
//		        $("#info-node .node-coordinates").text("[" + row.lat + ", " + row.lon + "]");
//		        $("#info-node .node-img").html((!row.screenshot || row.screenshot == "") ? "" : '<a href="' + row.screenshot + '"><img src="' + row.screenshot + '" width="300px"></img></a>');
//		        $("#info-node").removeClass("hidden");
//		        BDO.sidebar.open("info");
//		    };
//		    $(aMarker).click(showInfoForMarker);
//		    $(aMarker).hover(function() { this.openPopup(); } , function(){this.closePopup();} );
//		    aMarker.name = row.name;
//		    aMarker.show = showInfoForMarker;
//		    aMarker.row = row;
//		    BDO.addMarker(aMarker);
//		}
//	
//		var addSidebarFor = function(configRow) {
//		    var sheetName = configRow.name;
//		    var sheetId = configRow.id;
//	
//		    var sidebarP = $('<p></p>');
//		    sidebarP.text(sheetName);
//		    var sidebarDiv = $('<div></div>');
//		    var id = 'layer-' + sheetId;
//		    sidebarDiv.attr('id', id);
//		    sidebarDiv.addClass('sidebar-layer');
//		    sidebarDiv.addClass('active');
//		    sidebarDiv.click(function() {
//		        var sidebarActive = $('#' + id).hasClass('active');
//		        for (var layerMapObj of BDO.dynamicLayers) {
//		            var layer = layerMapObj[1];
//		            if (layer.type == sheetId) {
//		                if (sidebarActive) BDO.map.removeLayer(layer);
//		                else BDO.map.addLayer(layer);
//		            }
//		        }
//		        if (sidebarActive) {
//		            sidebarDiv.removeClass('active');
//		            sidebarDiv.addClass('inactive');
//		        } else {
//		            sidebarDiv.removeClass('inactive');
//		            sidebarDiv.addClass('active');
//		        }
//		    });
//		    $("#layer-content").append(sidebarDiv);
//		    var icon = BDO.icons.get(configRow.marker);
//		    if (icon) {
//		        var sidebarImg = $('<img></img>');
//		        sidebarImg.attr('src', icon.options.iconUrl);
//		        sidebarDiv.append(sidebarImg);
//		    }
//		    var circleColor = configRow.circle;
//		    if (circleColor) {
//		        var sidebarCircle = $('<span>&nbsp;</span>');
//		        sidebarCircle.attr('class', 'circle');
//		        sidebarCircle.attr('style', 'background: ' + circleColor);
//		        sidebarDiv.append(sidebarCircle);
//		    }
//		    var polygonColor = configRow.polygon;
//		    if (polygonColor) {
//		        var sidebarCircle = $('<span>&nbsp;</span>');
//		        sidebarCircle.attr('class', 'polygon');
//		        sidebarCircle.attr('style', 'background: ' + polygonColor + '; border: solid ' + polygonColor + '1px');
//		        sidebarDiv.append(sidebarCircle);
//		    }
//		    sidebarDiv.append(sidebarP);
//		}
//	
//		$scope.loadPointsOfInterest = function() {
//			for (var layerMapObj of BDO.dynamicLayers) {
//				var layer = layerMapObj[1];
//				$scope.pointsOfInterest.push(layer);
//			}
//			$scope.$apply()
//		};
//	
//		var observer = new MutationObserver(function(mutations) {
//		  for (var mutation of mutations) {
//		    for (var i = 0; i < mutation.addedNodes.length; i++) {
//		    	var id = parseInt($(mutation.addedNodes[i]).attr('id'));
//		    	if (id) {
//		    		BDO.map.addLayer(BDO.dynamicLayers.get(id));
//				}
//		    }
//		    for (var i = 0; i < mutation.removedNodes.length; i++) {
//		    	var id = parseInt($(mutation.removedNodes[i]).attr('id'));
//		    	if (id) {
//		    		BDO.map.removeLayer(BDO.dynamicLayers.get(id));
//		    	}
//		    }
//		  };
//		});
//	
//		observer.observe(document.getElementById("search-list"), {childList: true, attributes: false, characterData: false, subtree: false, attributeOldValue: false, characterDataOldValue: false});
//	 });
>>>>>>> 2bd400d63b0edea0115ec814b261499683a32bb2
