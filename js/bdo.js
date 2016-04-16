BDO = {};
BDO.map = L.map('map').setView([0, 0], 0);
BDO.icons = new Map();
BDO.markers = new Array();
BDO.circles =  new Array();
BDO.polygons =  new Array();
BDO.treeTypes = new Array();

var googleDocCode = "1VtxMqver7ocbImx9IdTsTX0KdfAgbRCJcRK-J2w5yv8";
var configTabName = "Configuration";

BDO.LeafIcon = L.Icon.extend({
    options: {
        iconSize: [47, 37],
        iconAnchor: [25, 45],
        popupAnchor: [0, -47]
    }
});

var mapMinZoom = 2;
var mapMaxZoom = 6;
var mapBounds = new L.LatLngBounds(BDO.map.unproject([0, 16384], mapMaxZoom), BDO.map.unproject([16384, 8602], mapMaxZoom));
BDO.map.fitBounds(mapBounds);

BDO.tileLayer = L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 6,
    attribution: 'Aequitas Black Desert Map',
    tms: true,
    continuousWorld: true,
    noWarp: true
});
BDO.map.addLayer(BDO.tileLayer);

BDO.sidebar = L.control.sidebar('sidebar').addTo(BDO.map);

/* Consider moving everything below to a new class */

var hideInfoDivs = function () {
    $("#info-coordinates").addClass("hidden");
    $("#info-node").addClass("hidden");
}

var showCoordinates = function(e) {
    hideInfoDivs();
    $("#info .sidebar-header").children().first().text("Coordinates [Lat, Long]");
    $("#info-coordinates .coord-data").html("[" + e.latlng.lat + ", " + e.latlng.lng + "]");
    $("#info-coordinates").removeClass("hidden");
    BDO.sidebar.open("info");
}

BDO.map.on('click', showCoordinates);

var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [47, 37],
        iconAnchor: [25, 45],
        popupAnchor: [0, -47]
    }
});

var polygonPopupLocation = function(latlngs) {
    var maxLat;
    var avgLng = 0;
    for (var latlng of latlngs) {
        if (!maxLat || latlng.lat > maxLat) {
            maxLat = latlng.lat;
        }
        avgLng += latlng.lng;
    }
    avgLng /= latlngs.length;
    return new L.LatLng(maxLat, avgLng);
}

var createMarker = function(sheetId, sheetName, icon, row) {
    var aMarker = L.marker([row.lat, row.lon], {icon: BDO.icons.get(icon)});
    aMarker.type = sheetId;
    var headerText = sheetName.charAt(sheetName.length - 1) == 's' ? sheetName.substring(0, sheetName.length - 1) : sheetName;
    var popupHeader = $('<div class="popup-header">' + row.name + '</div>');
    var popupData = $('<div class="popup-data"></div>');
    if (row.additional) {
    	var data = row.additional.split(',');
    	if (data) {
    		popupHeader.attr('style', 'border-bottom: 1px solid black; margin-bottom: 5px;');
    		popupData.text(data);
		}
    }
    var popup = $('<div class="popup"></div>');
    popup.append(popupHeader);
    popup.append(popupData);
    aMarker.bindPopup(popup.html());
    $(aMarker).click(function() {
        hideInfoDivs();
        $("#info .sidebar-header").children().first().text(headerText);
        $("#info-node .node-name").text(row.name);
        $("#info-node .node-notes").text(row.notes);
        $("#info-node .node-coordinates").text("[" + row.lat + ", " + row.lon + "]");
        $("#info-node .node-img").html((!row.screenshot || row.screenshot == "") ? "" : '<a href="' + row.screenshot + '"><img src="' + row.screenshot + '" width="300px"></img></a>');
        $("#info-node").removeClass("hidden");
        BDO.sidebar.open("info");
    });
    $(aMarker).hover(function(){this.openPopup();}/*, function(){this.closePopup();}*/);
    BDO.map.addLayer(aMarker);
    BDO.markers.push(aMarker);
}

var createCircle = function(sheetId, color, row) {
    var aCircle = L.circle([row.lat, row.lon], 11000, {
        color: color,
        fillColor: color,
        fillOpacity: 0.5
    });
    aCircle.type = sheetId;
    BDO.map.addLayer(aCircle);
    BDO.circles.push(aCircle);
}

var drawPolygon = function(sheetId, color, row) {
    var aPolygon = L.polygon(JSON.parse(row.vertices), {color:color});
    aPolygon.bindPopup(row.type);
    $(aPolygon).hover(function(){this.openPopup(polygonPopupLocation(aPolygon._latlngs));}, function(){this.closePopup();});
    aPolygon.on('click', showCoordinates);
    aPolygon.type = sheetId;
    BDO.map.addLayer(aPolygon);
    BDO.polygons.push(aPolygon);
}

var loadIcons = function(tabletop) {
    for (var icon of tabletop.sheets("Icons").all()) {
        BDO.icons.set(icon.icon, new LeafIcon({iconUrl: icon.url}));
    }
}

var loadTreeTypes = function(tabletop) {
    for (var treeType of tabletop.sheets("Tree Types").all()) {
        BDO.treeTypes.push(treeType);
    }
}

var addSidebarFor = function(configRow) {
    var sheetName = configRow.name;
    var sheetId = configRow.id;

    var sidebarP = $('<p></p>');
    sidebarP.text(sheetName);
    var sidebarDiv = $('<div></div>');
    var id = 'layer-' + sheetId;
    sidebarDiv.attr('id', id);
    sidebarDiv.addClass('sidebar-layer');
    sidebarDiv.addClass('active');
    sidebarDiv.click(function() {
        var sidebarActive = $('#' + id).hasClass('active');
        if (configRow.marker) {
            for (var aMarker of BDO.markers) {
                if (aMarker.type == sheetId) {
                    if (sidebarActive) BDO.map.removeLayer(aMarker);
                    else BDO.map.addLayer(aMarker);
                }
            }
        }
        if (configRow.circle) {
            for (var aCircle of BDO.circles) {
                if (aCircle.type == sheetId) {
                    if (sidebarActive) BDO.map.removeLayer(aCircle);
                    else BDO.map.addLayer(aCircle);
                }
            }
        }
        if (configRow.polygon) {
            for (var aPolygon of BDO.polygons) {
                if (aPolygon.type == sheetId) {
                    if (sidebarActive) BDO.map.removeLayer(aPolygon);
                    else BDO.map.addLayer(aPolygon);
                }
            }
        }
        if (sidebarActive) {
            sidebarDiv.removeClass('active');
            sidebarDiv.addClass('inactive');
        } else {
            sidebarDiv.removeClass('inactive');
            sidebarDiv.addClass('active');
        }
    });
    $("#layer-content").append(sidebarDiv);
    var icon = BDO.icons.get(configRow.marker);
    if (icon) {
        var sidebarImg = $('<img></img>');
        sidebarImg.attr('src', icon.options.iconUrl);
        sidebarDiv.append(sidebarImg);
    }
    var circleColor = configRow.circle;
    if (circleColor) {
        var sidebarCircle = $('<span>&nbsp;</span>');
        sidebarCircle.attr('class', 'circle');
        sidebarCircle.attr('style', 'background: ' + circleColor);
        sidebarDiv.append(sidebarCircle);
    }
    var polygonColor = configRow.polygon;
    if (polygonColor) {
        var sidebarCircle = $('<span>&nbsp;</span>');
        sidebarCircle.attr('class', 'polygon');
        sidebarCircle.attr('style', 'background: ' + polygonColor + '; border: solid ' + polygonColor + '1px');
        sidebarDiv.append(sidebarCircle);
    }
    sidebarDiv.append(sidebarP);
}

BDO.tabletop = Tabletop.init({
    key: googleDocCode,
    callback: function(data, tabletop) {
        loadIcons(tabletop);
        loadTreeTypes(tabletop);
        for (var configRow of tabletop.sheets(configTabName).all()) {
            var sheetName = configRow.name;
            var sheetId = configRow.id;
            var sheet = tabletop.sheets(sheetName);
            if (!sheet) continue;
            addSidebarFor(configRow);
            for (var row of sheet.all()) {
                if (configRow.marker) {
                    createMarker(sheetId, sheetName, configRow.marker, row);
                }
                if (configRow.circle) {
                    createCircle(sheetId, configRow.circle, row);
                }
                if (configRow.polygon) {
                    drawPolygon(sheetId, configRow.polygon, row);
                }
            }
        }
    }
});
