API_ENDPOINT = "http://localhost:8080/api";

var servicesApp = angular.module('bdoApp.services', ['ngResource']);

servicesApp.factory('EntityService', function($resource) {
	return $resource(API_ENDPOINT + '/mapEntities');
});

servicesApp.factory('TypeService', function($resource) {
	return $resource(API_ENDPOINT + '/mapEntityTypes');
});