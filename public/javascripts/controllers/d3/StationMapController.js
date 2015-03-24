angular.module("train")
    .controller("StationMapController", function($scope, trainServices, helperServices, cacheServices) {
        $scope.title = "Station Map";

        trainServices.getLines()
            .success(function(lines){
                $scope.lines = lines;
                $scope.selectedLine = $scope.lines[0];
            });
        trainServices.getStations()
            .success(function(stations) {
                $scope.stations = stations;
            });

        $scope.stationInLineFn = function(station) {
            return _.any(station.lines, function(line){
                return line === $scope.selectedLine.name;
            });
        }

        $scope.plotMap = function() {
            var w = 700;
            var h = 500;

            //Define map projection
            var projection = d3.geo.albersUsa()
                .translate([w/2, h/2])
                .scale([500]);

            //Define path generator
            var path = d3.geo.path()
                .projection(projection);

            //Create SVG element
            var svg = d3.select("#svgContainer").append("svg").attr({width:w, height: h});

            //Load in GeoJSON data
            d3.json("data/us.json", function(json) {

                //Bind data and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill","#666666");

                //Load in cities data
                d3.csv("data/sales-by-city.csv", function(data) {

                    svg.selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {
                            if (!d) {
                                console.log("no d");
                            }
                            var p = projection([d.lon, d.lat]);
                            if (!p || p.length == 0) {
                                console.log("bad projection");
                                return -1;
                            }
                            return p[0];
                        })
                        .attr("cy", function(d) {
                            var p = projection([d.lon, d.lat]);
                            if (!p || p.length == 0) {
                                console.log("bad projection");
                                return -1;
                            }
                            return p[1];
                        })
                        .attr("r", function(d) {
                            return Math.sqrt(parseInt(d.sales)* 0.00005);
                        })
                        .style("fill", "red");

                });
            });
        };

        $scope.plotMap();
    });
