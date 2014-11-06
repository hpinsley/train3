angular.module("train")
    .controller("StationsController", function($scope, $location, trainServices){

        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

        $scope.deleteStation = function(station) {
            if (confirm("Do you really want to delete " + station.name + "?")) {
                trainServices.deleteStation(station)
                    .then(function(result){
                        alert(result.data.msg);
                        $location.path("/");
                    });
            }
        }
    });