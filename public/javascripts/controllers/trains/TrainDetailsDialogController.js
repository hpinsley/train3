angular.module("train")
    .controller("TrainDetailsDialogController", function ($scope, $log) {
        $log.info("In TrainDetailsDialogController");

        $scope.trainCount = 1;

        $scope.onClose = function(minutes, trainCount) {
            if ($scope.minutes) {
                $scope.$close({minutes: minutes, trainCount: trainCount || 1});
            }
            else {
                alert("You must enter the number of minutes");
            }
        };

        $scope.onCancel = function() {
            $scope.$dismiss();
        }

    });