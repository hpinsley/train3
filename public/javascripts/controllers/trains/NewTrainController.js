angular.module("train")
    .controller("NewTrainController", function ($scope, $location, trainServices) {

        var stationSort = function(s1, s2) {
            if (s1.name < s2.name) return -1;
            if (s1.name > s2.name) return 1;
            return 0;
        };

        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data.sort(stationSort);
            });
        $scope.addTrain = function () {
            console.log("Adding train " + $scope.train.number);
            trainServices.addTrain($scope.train)
                .then(function() {
                    $location.path("/trains");
                });
        }
    });