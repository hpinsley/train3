angular.module("train")
    .controller("TrainsController", function($scope, trainServices, $location){
        $scope.title = "This is from trains controller";

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
            });

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

        $scope.selectedStopsFn = function(train) {
            var startStation = $scope.startStation;
            var endStation = $scope.endStation;

            if (!startStation || !endStation) {
                return true;
            }
            var startIndex = _.findIndex(train.stops, function(stop) { return stop.station == startStation});
            var endIndex = _.findIndex(train.stops, function(stop) { return stop.station == endStation});

            return (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex);
        };

        $scope.clearFilters = function() {
            $scope.startStation = null;
            $scope.endStation = null;
        }

        $scope.newTrain = function() {
            trainServices.addTrain()
                .then(function(res){
                    var train = res.data[0];
                    $location.path("/trains/" + train.number);
                });
        }
    });