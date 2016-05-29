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

	$scope.icons = [];	
	TypeService.query({'ajaxId':'icons'}, function(data) {
		$scope.icons = data;
	});
});

controllerApp.controller('MapController', function($scope, EntityService) {
	$scope.defaultIcon = L.Icon.extend({
		options: {
			iconSize: [25, 41],
	        iconAnchor: [12, 45],
	        popupAnchor: [-12, -45]
		}
	});
	$scope.LeafIcon = L.Icon.extend({
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
	map.mapLayers = [];
	map.mapLayersMap = new Map();
	
	map.addMapLayer = function(layer) {
		map.mapLayers.push(layer);
		map.mapLayersMap.set(layer.entity.id, layer);
	}
	
	var addEntity = function(index, entity) {
		$(entity.markers).each(function() {
			try {
				var marker = this;
				var icon = (marker && marker.icon && marker.icon.url) ? new $scope.LeafIcon({ iconUrl: marker.icon.url }) : new $scope.defaultIcon({ iconUrl: '../images/marker-icon.png' });
				var mapMarker = L.marker([marker.latitude, marker.longitude], { icon: icon });
				mapMarker.addTo(map);
				mapMarker.entity = entity;
				mapMarker.marker = marker;
				mapMarker.bindPopup(entity.title);
				$(mapMarker).hover(function() { this.openPopup(); } , function(){this.closePopup();} );
				map.addMapLayer(mapMarker);
			} catch (err) {
				console.log("Error adding marker: " + err);
				console.log(entity);
			}
		});
		$(entity.circles).each(function() {
			try {
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
				map.addMapLayer(mapCircle);
			} catch (err) {
				console.log("Error adding circle: " + err);
				console.log(entity);
			}
		});
		$(entity.polygons).each(function() {
			try {
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
				map.addMapLayer(mapPolygon);
			} catch (err) {
				console.log("Error adding polygon: " + err);
				console.log(entity);
			}
		});
	};

	L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
		minZoom: 2,
		maxZoom: 6,
		attribution: 'Aequitas Black Desert Map',
		tms: true,
		continuousWorld: true,
		noWarp: true
	}).addTo(map);

	$($scope.entities).each(addEntity);

	/* Draw Controls */
	var drawnItems = new L.FeatureGroup().addTo(map);
	var drawControl = new L.Control.Draw({
		draw: {
			polyline: false,
			rectangle: false,
			marker: {
				icon: new $scope.defaultIcon({ iconUrl: '../images/marker-icon.png' })
			}
		}
//	    edit: {
//	        featureGroup: drawnItems
//	    }
	}).addTo(map);
	map.on('draw:created', function (e) {
		sidebar.close('info');
	    var type = e.layerType;
	    var layer = e.layer;

	    $scope.activeEntity = new EntityService();
	    $scope.activeEntity.title = '';
	    $scope.activeEntity.types = [];
	    $scope.activeEntity.circles = [];
	    $scope.activeEntity.markers = [];
	    $scope.activeEntity.polygons = [];
	    $scope.activeEntity.notes = [];
	    $scope.activeEntity.images = [];
	    $scope.activeEntity.addNote = function() {
	    	$scope.activeEntity.notes.push({});
	    }
	    $scope.activeEntity.removeNote = function(index) {
    		$scope.activeEntity.notes.splice(index, 1);
	    }
	    $scope.activeEntity.addImage = function() {
	    	$scope.activeEntity.images.push({});
	    }
	    $scope.activeEntity.removeImage = function(index) {
	    	$scope.activeEntity.images.splice(index, 1);
	    }
	    
	    $scope.saveEntity = function(entityToSave) {
	    	entityToSave.$save({'ajaxId':'saveEntity'}, function(savedEntity) {
		    	addEntity(0, savedEntity);
		    });
		    $scope.closeModal();
	    }
	    
	    $scope.closeModal = function() {
	    	$scope.saveEntity = null;
	    	$scope.closeModal = null;
	    }

	    if (type === 'marker') {
	        var marker = {};
	        marker.latitude = layer._latlng.lat;
	        marker.longitude = layer._latlng.lng;
	        $scope.activeEntity.markers.push(marker);
	        $('#markerModal').modal('show');
	    } else if (type === 'circle') {
	    	var circle = {};
	    	circle.latitude = layer._latlng.lat;
	    	circle.longitude = layer._latlng.lng;
	    	circle.radius = layer._mRadius;
	    	circle.outlineColor = layer.options.color;
	    	circle.fillColor = layer.options.color;
	    	$scope.activeEntity.circles.push(circle);
	    	$('#circleModal').modal('show');
	    } else if (type === 'polygon') {
	    	var polygon = {};
	    	polygon.vertices = '';
	    	$(layer._latlngs).each(function() {
	    		polygon.vertices += (polygon.vertices) ? ',' : '[';
	    		polygon.vertices += '[' + this.lat + ',' + this.lng + ']';
	    	});
	    	polygon.vertices += ']';
	    	polygon.outlineColor = layer.options.color;
	    	polygon.fillColor = layer.options.color;
	    	$scope.activeEntity.polygons.push(polygon);
	    	$('#polygonModal').modal('show');
	    }
	    $scope.$apply();
	});
});

controllerApp.controller('SidebarController', function($scope) {
	sidebar = L.control.sidebar('sidebar', {
		position: 'right'
	}).addTo(map);

	/* Hide other sidebar items and show the clicked coordinates */
	map.on('click', function(e) {
	    $('#info-coordinates').addClass('hidden');
	    $('#info-node').addClass('hidden');
	    $('#info .sidebar-header').children().first().text('Coordinates [Lat, Long]');
	    $('#info-coordinates .coord-data').html('[' + e.latlng.lat + ', ' + e.latlng.lng + ']');
	    $('#info-coordinates').removeClass('hidden');
	    sidebar.open('info');
	});

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
		var entity = this.entity;
		var openSidebarInfo = function(coordinates) {
			$('#info-coordinates').addClass('hidden');
		    $('#info-node').addClass('hidden');

		    $('#info .sidebar-header').children().first().text(entity.title);
		    $('#info-node .node-notes').text('');
			if (entity.notes) {
				$(entity.notes).each(function() {
		    		$('#info-node .node-notes').append('<p>' + this.note + '</p>');
		    	});
		    }
			$('#info-node .node-img').text('');
			if (entity.images) {
				$(entity.images).each(function() {
		    		$('#info-node .node-img').append('<a href="' + this.url + '"><img src="' + this.url + '" width="300px"></img></a><br />');
		    	});
		    }
			$('info-node .node-coordinates').text(coordinates);
			
			$('#info-node').removeClass('hidden');
		    sidebar.open('info');
		}

		if (entity.markers && entity.markers[0]) {
			$(this).click(function(e) {
			    openSidebarInfo('[' + entity.markers[0].latitude + ', ' + entity.markers[0].longitude + ']');
			});
		}
		
		if (entity.circles && entity.circles[0]) {
			$(this).click(function(e) {
				openSidebarInfo('[' + entity.circles[0].latitude + ', ' + entity.circles[0].longitude + ']');
			});
		}

		if (entity.polygons && entity.polygons[0]) {
			$(this).click(function(e) {
				openSidebarInfo(entity.polygons[0].vertices);
			});
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
});
