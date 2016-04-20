var angularApp = angular.module("bdoApp", []);
 angularApp.controller("SearchController", function($scope) {
	$scope.pointsOfInterest = new Array();
	
	$scope.rand = function(r) {
		return r + Math.random;
	}
 });