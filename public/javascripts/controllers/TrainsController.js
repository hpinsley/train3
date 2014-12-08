angular.module("train")
    .controller("TrainsController", function($scope, trainServices, $location){
        $scope.title = "This is from trains controller";

        $scope.items = ["apple", "banana", "orange"]

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

        $scope.newTrain = function() {
            trainServices.addTrain()
                .then(function(res){
                    var train = res.data[0];
                    $location.path("/trains/" + train.number);
                });
        }
    });