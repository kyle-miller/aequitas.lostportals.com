API_ENDPOINT = "http://aequitas.lostportals.com/api";

var servicesApp = angular.module('bdoApp.services', ['ngResource']);

servicesApp.factory('EntityService', function($resource) {
	return $resource(API_ENDPOINT + '/mapEntities');
});

servicesApp.factory('TypeService', function($resource) {
	return $resource(API_ENDPOINT + '/mapEntityTypes');
});

servicesApp.factory('IconService', function($resource) {
	return $resource(API_ENDPOINT + '/mapIcons');
});