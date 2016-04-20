var angularApp = angular.module("bdoApp", []);
 angularApp.controller("SearchController", function($scope) {
	$scope.pointsOfInterest = new Array();

	$scope.loadPointsOfInterest = function() {
		for (var layerMapObj of BDO.dynamicLayers) {
			var layer = layerMapObj[1];
			$scope.pointsOfInterest.push(layer);
		}
	};

	var observer = new MutationObserver(function(mutations) {
	  for (var mutation of mutations) {
	    for (var i = 0; i < mutation.addedNodes.length; i++) {
	    	var id = parseInt($(mutation.addedNodes[i]).attr('id'));
	    	if (id) {
	    		BDO.map.addLayer(BDO.dynamicLayers.get(id));
			}
	    }
	    for (var i = 0; i < mutation.removedNodes.length; i++) {
	    	var id = parseInt($(mutation.removedNodes[i]).attr('id'));
	    	if (id) {
	    		BDO.map.removeLayer(BDO.dynamicLayers.get(id));
	    	}
	    }
	  };
	});

	observer.observe(document.getElementById("search-list"), {childList: true, attributes: false, characterData: false, subtree: false, attributeOldValue: false, characterDataOldValue: false});
 });