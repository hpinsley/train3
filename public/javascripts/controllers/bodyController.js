angular.module("train")
    .controller("bodyController", function($scope, $location){
        $scope.title = "This is the body controller title";

        $scope.getClass = function(path) {
            var curPath = $location.path();

            if (path == "/") {
                return (curPath == path) ? "active" : "";
            }

            if (curPath.substr(0, path.length) == path) {
                return "active";
            }

            return "";
        };
    });