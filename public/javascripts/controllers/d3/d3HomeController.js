angular.module("train")
    .controller("d3HomeController", function($scope, $http) {
        $scope.title = "d3";

        $http.get("/data/reddit-pics.json")
            .success(function(data){
                svgPlay(data);
            });

        var svgPlay = function(data) {
            var svg = d3.select("svg");

            for (var x = 30; x < 400; x+=40) {
                svg.append('circle')
                    .attr({
                        cx: x,
                        cy: 10,
                        r: 10,
                        fill: "green"
                    });
            }

            svg.append('circle')
                .attr({
                    cx: "50%",
                    cy: 300,
                    r: 100,
                    fill: "red"
                });
        };
    });
