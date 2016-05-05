BDO = {};
BDO.map = L.map('map').setView([-70, 0], 3);
BDO.icons = new Map();
BDO.dynamicLayers = new Map();
BDO.markers = new Array();
BDO.circles = new Array();
BDO.polygons = new Array();
BDO.treeTypes = new Array();
BDO.LeafIcon = L.Icon.extend({
    options: {
        iconSize: [47, 37],
        iconAnchor: [25, 45],
        popupAnchor: [0, -47]
    }
});

var mapMinZoom = 2;
var mapMaxZoom = 6;
// var mapBounds = new L.LatLngBounds(BDO.map.unproject([0, 16384], mapMaxZoom), BDO.map.unproject([16384, 8602], mapMaxZoom));
// BDO.map.fitBounds(mapBounds);

BDO.tileLayer = L.tileLayer('http://aequitas.lostportals.com/map/{z}/{x}/{y}.png', {
    minZoom: mapMinZoom,
    maxZoom: mapMaxZoom,
    attribution: 'Aequitas Black Desert Map',
    tms: true,
    continuousWorld: true,
    noWarp: true
});
BDO.map.addLayer(BDO.tileLayer);

BDO.sidebar = L.control.sidebar('sidebar').addTo(BDO.map);

BDO.drawnItems = new L.FeatureGroup().addTo(BDO.map);

BDO.drawControl = new L.Control.Draw({
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
        featureGroup: BDO.drawnItems
    }
});
BDO.map.addControl(BDO.drawControl);

BDO.map.on('draw:created', function (e) {
    // Save to spreadsheet
    BDO.drawnItems.addLayer(e.layer);
});

var random = function() {
    return Math.floor(Math.random() * 100000000000000000);
}

BDO.addMarker = function(marker) {
    marker.id = random();
    BDO.map.addLayer(marker);
    BDO.markers.push(marker);
    BDO.dynamicLayers.set(marker.id, marker);
}

BDO.addCircle = function(circle) {
    circle.id = random();
    BDO.map.addLayer(circle);
    BDO.circles.push(circle);
    BDO.dynamicLayers.set(circle.id, circle);
}

BDO.addPolygon = function(polygon) {
    polygon.id = random();
    BDO.map.addLayer(polygon);
    BDO.polygons.push(polygon);
    BDO.dynamicLayers.set(polygon.id, polygon);
}
