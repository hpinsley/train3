angular.module('train', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/trains/new',{
                templateUrl: 'views/trains/newTrain.html',
                controller: 'NewTrainController'
            })
            .when('/trains', {
                templateUrl: 'views/trains/trains.html',
                controller: 'TrainsController'
            })
            .when('/stations/new', {
                templateUrl: 'views/stations/newStation.html',
                controller: 'NewStationController'
            })
            .when('/stations', {
                templateUrl: 'views/stations/stations.html',
                controller: 'StationsController'
            })
            .otherwise({
               redirectTo: '/'
            });
    }]);
