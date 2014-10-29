angular.module('train', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/trains', {
                templateUrl: 'views/trains/trains.html',
                controller: 'TrainsController'
            })
            .when('/stations', {
                templateUrl: 'views/stations/stations.html',
                controller: 'StationsController'
            })
            .otherwise({
               redirectTo: '/'
            });
    }]);
