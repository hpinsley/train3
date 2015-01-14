angular.module('train', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/trains/:trainNumber',{
                templateUrl: 'views/trains/details.html',
                controller: 'TrainDetailsController'
            })
            .when('/trains', {
                templateUrl: 'views/trains/trains.html',
                controller: 'TrainsController'
            })
            .when('/stations/new', {
                templateUrl: 'views/stations/newStation.html',
                controller: 'NewStationController'
            })
            .when('/stations/:stationAbbr',{
                templateUrl: 'views/stations/details.html',
                controller: 'StationDetailsController'
            })
            .when('/stations', {
                templateUrl: 'views/stations/stations.html',
                controller: 'StationsController'
            })
            .otherwise({
               redirectTo: '/'
            });
    }])
    .run(["cacheServices", function(cacheServices){
        cacheServices.init();
    }]);
