angular.module('train', ['ngRoute','ui.bootstrap'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/trains/:trainNumber/trip',{
                templateUrl: 'views/trains/trip.html',
                controller: 'TripController'
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
            .when('/stations/stationgrid', {
                templateUrl: 'views/stations/stationGrid.html',
                controller: 'StationGridController'
            })
            .when('/stations/:stationAbbr',{
                templateUrl: 'views/stations/details.html',
                controller: 'StationDetailsController'
            })
            .when('/stations', {
                templateUrl: 'views/stations/stations.html',
                controller: 'StationsController'
            })
            .when('/lines/:lineName', {
                templateUrl: 'views/lines/lineDetails.html',
                controller: 'LineDetailsController'
            })
            .when('/lines', {
                templateUrl: 'views/lines/lines.html',
                controller: 'LinesController'
            })
            .when('/poi/new', {
                templateUrl: 'views/poi/newPointOfInterest.html',
                controller: 'newPointOfInterestController'
            })
            .when('/poi/:number',{
                templateUrl: 'views/poi/poiDetails.html',
                controller: 'poiDetailsController'
            })
            .when('/poi', {
                templateUrl: 'views/poi/poi.html',
                controller: 'poiController'
            })
            .when('/d3/trainsPerStation', {
                templateUrl: 'views/d3/TrainsPerStation.html',
                controller: 'TrainsPerStationController'
            })
            .when('/d3/trainScatter', {
                templateUrl: 'views/d3/TrainScatter.html',
                controller: 'TrainScatterController'
            })
            .when('/d3/stationMap', {
                templateUrl: 'views/d3/StationMap.html',
                controller: 'StationMapController'
            })
            .otherwise({
               redirectTo: '/'
            });
    }])
    .run(["cacheServices", function(cacheServices){
        cacheServices.init();
    }]);
