angular.module("train")
    .controller("StationMapController", function($scope, trainServices, helperServices, cacheServices) {
        $scope.title = "Station Map";

        trainServices.getLines()
            .then(function(res){
                $scope.lines = res.data;
                $scope.selectedLine = $scope.lines[0];
            })
            .then(function(){
                trainServices.getStations()
                    .success(function(stations) {
                        $scope.stations = stations;
                    });
            });

        $scope.stationInLineFn = function(station) {
            return _.any(station.lines, function(line){
                return line === $scope.selectedLine.name;
            });
        }

        function PlotStationStops(svg, projection) {
            d3.csv("data/sales-by-city.csv", function (data) {

                svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
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
                    .attr("cy", function (d) {
                        var p = projection([d.lon, d.lat]);
                        if (!p || p.length == 0) {
                            console.log("bad projection");
                            return -1;
                        }
                        return p[1];
                    })
                    .attr("r", function (d) {
                        return Math.sqrt(parseInt(d.sales) * 0.00005);
                    })
                    .style("fill", "red");

            });
        }

        $scope.plotMap = function() {
            var w = 700;
            var h = 500;

            //Load in GeoJSON data
            d3.json("data/westchester.json", function(json) {

                var bounds = d3.geo.bounds(json.features[0]);
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];
                var padding = 30;

                var lngScale = d3.scale
                    .linear()
                    .domain([minLng, maxLng])
                    .range([padding,w-padding]);

                var latScale = d3.scale
                    .linear()
                    .domain([minLat, maxLat])
                    .range([h-padding,padding]);

                var customProjection = function(lngLat) {
                    var lng = lngLat[0];
                    var lat = lngLat[1];
                    return [lngScale(lng),latScale(lat)];
                };

                //Define path generator
                var path = d3.geo.path()
                    .projection(customProjection);

                //Create SVG element
                var svg = d3.select("#svgContainer").append("svg").attr({width:w, height: h});

                //Bind data and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill","#666666")
                    .attr("stroke", "black");

                //Load in cities data
                //PlotStationStops(svg, projection);
            });
        };

        $scope.plotMap();
    });
