angular.module("train")
    .controller("StationsController", function($scope, trainServices){

        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

        $scope.deleteStation = function(station) {
            confirm("Do you really want to delete " + station.name + "?");
        }
    });