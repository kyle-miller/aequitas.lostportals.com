var controllerApp = angular.module('bdoApp.controllers', []);

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

controllerApp.controller('MapController', function($scope) {
	var LeafIcon = L.Icon.extend({
	    options: {
	        iconSize: [47, 37],
	        iconAnchor: [25, 45],
	        popupAnchor: [0, -47]
	    }
	});
	
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

	var mapLayers = [];
	$($scope.entities).each(function() {
		var entity = this;
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
			var mapPolygon = L.polygon(JSON.parse(polygon.vertices), {
				color: polygon.outlineColor, 
				fillColor: polygon.fillColor
			});
			mapPolygon.addTo(map);
			mapPolygon.entity = entity;
			mapPolygon.polygon = polygon;
			mapPolygon.bindPopup(entity.title);
			$(mapPolygon).hover(function() { this.openPopup(polygonPopupLocation(this._latlngs)); } , function(){this.closePopup();} );
			mapLayers.push(mapPolygon);
		});
	});
	map.mapLayers = mapLayers;
});

controllerApp.controller('SidebarController', function($scope) {
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
	
	sidebar = L.control.sidebar('sidebar').addTo(map);
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
	});

	var showCoordinates = function(e) {
	    $('#info-coordinates').addClass('hidden');
	    $('#info-node').addClass('hidden');
	    $('#info .sidebar-header').children().first().text('Coordinates [Lat, Long]');
	    $('#info-coordinates .coord-data').html('[' + e.latlng.lat + ', ' + e.latlng.lng + ']');
	    $('#info-coordinates').removeClass('hidden');
	    sidebar.open('info');
	}
	map.on('click', showCoordinates);

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
});
	
//	angularApp.controller("SearchController", function($scope) {
//		$scope.pointsOfInterest = new Array();
//		var googleDocCode = "1VtxMqver7ocbImx9IdTsTX0KdfAgbRCJcRK-J2w5yv8";
//		var configTabName = "Configuration";
//	
//		/* Consider moving everything below to a new js file */
//	
//		var hideInfoDivs = function() {
//		    $("#info-coordinates").addClass("hidden");
//		    $("#info-node").addClass("hidden");
//		}
//	
//		var showCoordinates = function(e) {
//		    hideInfoDivs();
//		    $("#info .sidebar-header").children().first().text("Coordinates [Lat, Long]");
//		    $("#info-coordinates .coord-data").html("[" + e.latlng.lat + ", " + e.latlng.lng + "]");
//		    $("#info-coordinates").removeClass("hidden");
//		    BDO.sidebar.open("info");
//		}
//	
//		BDO.map.on('click', showCoordinates);
//	
//		var polygonPopupLocation = function(latlngs) {
//		    var maxLat;
//		    var avgLng = 0;
//		    for (var latlng of latlngs) {
//		        if (!maxLat || latlng.lat > maxLat) {
//		            maxLat = latlng.lat;
//		        }
//		        avgLng += latlng.lng;
//		    }
//		    avgLng /= latlngs.length;
//		    return new L.LatLng(maxLat, avgLng);
//		}
//	
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
//		var createCircle = function(sheetId, color, row) {
//		    var aCircle = L.circle([row.lat, row.lon], 11000, {
//		        color: color,
//		        fillColor: color,
//		        fillOpacity: 0.5
//		    });
//		    aCircle.type = sheetId;
//		    aCircle.name = row.name;
//		    aCircle.row = row;
//		    BDO.addCircle(aCircle);
//		}
//	
//		var drawPolygon = function(sheetId, color, row) {
//		    var aPolygon = L.polygon(JSON.parse(row.vertices), { color: color });
//		    aPolygon.bindPopup(row.name);
//		    $(aPolygon).hover(function() { this.openPopup(polygonPopupLocation(aPolygon._latlngs)); }, function() { this.closePopup(); });
//		    aPolygon.on('click', showCoordinates);
//		    aPolygon.type = sheetId;
//		    aPolygon.name = row.name;
//		    aPolygon.row = row;
//		    BDO.addPolygon(aPolygon);
//		}
//	
//		var loadIcons = function(tabletop) {
//		    for (var icon of tabletop.sheets("Icons").all()) {
//		        BDO.icons.set(icon.icon, new BDO.LeafIcon({ iconUrl: icon.url }));
//		    }
//		}
//	
//		var loadTreeTypes = function(tabletop) {
//		    for (var treeType of tabletop.sheets("Tree Types").all()) {
//		        BDO.treeTypes.push(treeType);
//		    }
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
//		BDO.tabletop = Tabletop.init({
//		    key: googleDocCode,
//		    callback: function(data, tabletop) {
//		        loadIcons(tabletop);
//		        loadTreeTypes(tabletop);
//		        for (var configRow of tabletop.sheets(configTabName).all()) {
//		            var sheetName = configRow.name;
//		            var sheetId = configRow.id;
//		            var sheet = tabletop.sheets(sheetName);
//		            if (!sheet) continue;
//		            addSidebarFor(configRow);
//		            for (var row of sheet.all()) {
//		            	if (row.vertices) {
//		            		row.vertexArray = JSON.parse(row.vertices);
//		            	}
//	
//		                if (configRow.marker) {
//		                    createMarker(sheetId, sheetName, configRow.marker, row);
//		                }
//		                if (configRow.circle) {
//		                    createCircle(sheetId, configRow.circle, row);
//		                }
//		                if (configRow.polygon) {
//		                    drawPolygon(sheetId, configRow.polygon, row);
//		                }
//		            }
//		        }
//		        angular.element('[ng-controller=SearchController]').scope().loadPointsOfInterest();
//		    }
//		});
//	
//		$scope.toggle = function(id) {
//			$('#' + id).toggle();
//			
//			var caret = $('[for=' + id + '] > span > i')
//			if ($('#' + id).css('display') == 'none') {
//				console.log($('[for=' + id + ']'));
//				caret.removeClass('fa-caret-down');
//				caret.addClass('fa-caret-right');
//			} else {
//				caret.removeClass('fa-caret-right');
//				caret.addClass('fa-caret-down');
//			}
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
//	
//		$('#layer-all').click(function() {
//			var sidebarDiv = $('#layer-all');
//	        var allLayersActive = sidebarDiv.hasClass('active');
//	        for (var layerMapObj of BDO.dynamicLayers) {
//	            var layer = layerMapObj[1];
//	            if (allLayersActive) BDO.map.removeLayer(layer);
//	            else BDO.map.addLayer(layer);
//	        }
//	        $('#layer-content .sidebar-layer').each(function() {
//		        if (allLayersActive) {
//		            $(this).removeClass('active');
//		            $(this).addClass('inactive');
//		        } else {
//		            $(this).removeClass('inactive');
//		            $(this).addClass('active');
//		        }
//	    	});
//	    });
//	 });