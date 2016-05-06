var bdoApp = angular.module('bdoApp', [ 'bdoApp.controllers', 'bdoApp.services', 'ngRoute' ]);

bdoApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({templateUrl: 'views/map.html', controller: 'MapController'})
}]);

bdoApp.run(function($location) {
	$location.path("/");
});