angular.module("train")
    .controller("TrainDetailsDialogController", function ($scope, $log) {
        $log.info("In TrainDetailsDialogController");

        $scope.onClose = function() {
            if ($scope.minutes) {
                $scope.$close($scope.minutes);
            }
            else {
                alert("You must enter the number of minutes");
            }
        };

        $scope.onCancel = function() {
            $scope.$dismiss();
        }

    });