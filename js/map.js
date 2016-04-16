
var map = L.map('map').setView([0, 0], 0);
var code = "1VtxMqver7ocbImx9IdTsTX0KdfAgbRCJcRK-J2w5yv8"

var mapMinZoom = 0;
var mapMaxZoom = 6;
var mapBounds = new L.LatLngBounds(
    map.unproject([0, 16384], mapMaxZoom),
    map.unproject([16384, 8602], mapMaxZoom));

map.fitBounds(mapBounds);

L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 6,
    attribution: 'Aequitas Black Desert Map',
    tms: true,
    continuousWorld: true,
    noWarp: true
}).addTo(map);

var sidebar = L.control.sidebar('sidebar').addTo(map);

var hideInfoDivs = function () {
    $("#info-coordinates").addClass("hidden");
    $("#info-node").addClass("hidden");
}

var showMarker = function(marker) {

}

var showCoordinates = function(e) {
    hideInfoDivs();
    $("#info .sidebar-header").children().first().text("Coordinates [Lat, Long]");
    $("#info-coordinates .coord-data").html("[" + e.latlng.lat + ", " + e.latlng.lng + "]");
    $("#info-coordinates").removeClass("hidden");
    sidebar.open("info");
}

map.on('click', showCoordinates);

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

icons = new Map();
markers = new Array();
circles =  new Array();
polygons =  new Array();

var createMarker = function(sheetId, sheetName, icon, row) {
    var aMarker = L.marker([row.lat, row.lon], {icon: icons.get(icon)});
    aMarker.type = sheetId;
    var headerText = sheetName.charAt(sheetName.length - 1) == 's' ? sheetName.substring(0, sheetName.length - 1) : sheetName;
    aMarker.bindPopup(row.name);
    $(aMarker).click(function() {
        hideInfoDivs();
        $("#info .sidebar-header").children().first().text(headerText);
        $("#info-node .node-name").text(row.name);
        $("#info-node .node-notes").text(row.notes);
        $("#info-node .node-coordinates").text("[" + row.lat + ", " + row.lon + "]");
        $("#info-node .node-img").html((!row.screenshot || row.screenshot == "") ? "" : '<a href="' + row.screenshot + '"><img src="' + row.screenshot + '" width="300px"></img></a>');
        $("#info-node").removeClass("hidden");
        sidebar.open("info");
    });
    $(aMarker).hover(function(){aMarker.openPopup();}, function(){aMarker.closePopup();});
    map.addLayer(aMarker);
    markers.push(aMarker);
}

var createCircle = function(sheetId, color, row) {
    var aCircle = L.circle([row.lat, row.lon], 11000, {
        color: color,
        fillColor: color,
        fillOpacity: 0.5
    });
    aCircle.type = sheetId;
    map.addLayer(aCircle);
    circles.push(aCircle);
}

var drawPolygon = function(sheetId, color, row) {
    var aPolygon = L.polygon(JSON.parse(row.vertices), {color:color});
    aPolygon.bindPopup(row.type);
    $(aPolygon).hover(function(){this.openPopup(polygonPopupLocation(aPolygon._latlngs));}, function(){this.closePopup();});
    $(aPolygon).click(showCoordinates);
    aPolygon.type = sheetId;
    map.addLayer(aPolygon);
    polygons.push(aPolygon);
}

var loadIcons = function(tabletop) {
    icons = new Map();
    for (var icon of tabletop.sheets("Icons").all()) {
        icons.set(icon.icon, new LeafIcon({iconUrl: icon.url}));
    }
}

var buildSidebarForLayer = function(configRow) {
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
            for (var aMarker of markers) {
                if (aMarker.type == sheetId) {
                    if (sidebarActive) map.removeLayer(aMarker);
                    else aMarker.addTo(map);
                }
            }
        }
        if (configRow.circle) {
            for (var aCircle of circles) {
                if (aCircle.type == sheetId) {
                    if (sidebarActive) map.removeLayer(aCircle);
                    else aCircle.addTo(map);
                }
            }
        }
        if (configRow.polygon) {
            for (var aPolygon of polygons) {
                if (aPolygon.type == sheetId) {
                    if (sidebarActive) map.removeLayer(aPolygon);
                    else aPolygon.addTo(map);
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
    var icon = icons.get(configRow.marker);
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
        console.log(sidebarCircle);
    }
    var polygonColor = configRow.polygon;
    if (polygonColor) {
        var sidebarCircle = $('<span>&nbsp;</span>');
        sidebarCircle.attr('class', 'polygon');
        sidebarCircle.attr('style', 'background: ' + polygonColor + '; border: solid ' + polygonColor + '1px');
        sidebarDiv.append(sidebarCircle);
        console.log(sidebarCircle);
    }
    sidebarDiv.append(sidebarP);
}

tabletop = Tabletop.init({
    key: code,
    callback: function(data, tabletop) {
        loadIcons(tabletop);
        for (var configRow of tabletop.sheets("Configuration").all()) {
            var sheetName = configRow.name;
            var sheetId = configRow.id;
            var sheet = tabletop.sheets(sheetName);
            if (!sheet) continue;
            buildSidebarForLayer(configRow);
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
