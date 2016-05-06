API_ENDPOINT = "http://localhost:8080/api";
angular.module('bdoApp.services', ['ngResource'])
	.factory('EntityService', function($resource) {
		return $resource(API_ENDPOINT + '/mapEntities');
	});