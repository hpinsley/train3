angular.module("train")
    .controller("StationMapController", function($scope, trainServices, helperServices, cacheServices) {

        var lngScale;
        var latScale;
        var svg;

        $scope.title = "Station Map";

        var tooltip = d3.select("section#mapSection")
            .append("div")
            .attr("id", "tooltip")
            .style({
                opacity: 0,
                left: 0,
                top: 0
            });

        trainServices.getLines()
            .then(function(res){
                $scope.lines = res.data;
                $scope.selectedLine = $scope.lines[0];
                plotSelectedLineMap();
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

        $scope.stationChange = function(station) {
            if (!station || !station.lnglat) {
                return;
            }
            plotStationLoc(station);
        };

        $scope.changeShowLinePath = function() {
            $scope.showLinePath ? showLinePath() : removeLinePath();
        };

        $scope.stationOrder = function(station) {
            return _.findIndex($scope.selectedLine.stations, function(lineStation){
                return station.abbr === lineStation;
            });
        }

        $scope.lineChange = function(line) {
            plotMap($scope.selectedLine.map);
            $scope.showLinePath = false;
            removeLinePath();
        };

        var hideTooltip = function() {
            tooltip.style("opacity", 0);
        };

        var buildStationTooltip = function(station) {
            var str = "<a href='/#/stations/" + station.abbr + "'>" + station.name + "</a><br/>";

            if (station.lines.length == 1) {
                str = str + station.lines[0] + " line";
            }
            else {
                str = str + "on line(s): " +
                station.lines.join(", ");
            }
            if (station.lnglat) {
                str = str + "<br/>[" + station.lnglat[0].toFixed(2) + "," + station.lnglat[1].toFixed(2) + "]";
            }
            return str;
        };

        var showLinePath = function() {
            if (!svg) {
                return;
            }
            var line = $scope.selectedLine;
            var stations = _.filter($scope.stations, function(station) {
                return station.lnglat && _.any(line.stations, function (lineStation) {
                    return lineStation === station.abbr;
                })
            });

            var orderedStations = _.sortBy(stations, function(station) {
                return _.findIndex(line.stations, function(lineStation){
                    return lineStation == station.abbr;
                });
            });

            var lineFun = d3.svg.line()
                .x(function (station) { return lngScale(station.lnglat[0])})
                .y(function (station) { return latScale(station.lnglat[1])})
                .interpolate("linear");

            var lineGroup = svg.append("g").attr("class", "linePath");

            lineGroup.append("path")
                .attr({
                    d: lineFun(orderedStations),
                    "stroke": "yellow",
                    "stroke-width": 3,
                    "fill": "none"
                });

            lineGroup.selectAll("circle.linePathCircle")
                .data(orderedStations)
                .enter()
                .append("circle")
                .attr({
                    class: "linePathCircle",
                    cx: function(station) { return lngScale(station.lnglat[0]);},
                    cy: function(station) { return latScale(station.lnglat[1]);},
                    r: 5,
                    fill: "blue"
                });
        };

        var removeLinePath = function() {
            if (!svg) {
                return;
            }
            svg.select("g.linePath").remove();
        };

        var plotSelectedLineMap = function() {
            plotMap($scope.selectedLine.map);
        }


        var plotStationLoc = function(station) {
            var lng = station.lnglat[0];
            var lat = station.lnglat[1];
            var cx = lngScale(lng);
            var cy = latScale(lat);

            svg.selectAll("circle.stopPoint").remove();

            svg.append("circle")
                .attr({
                    class: "stopPoint",
                    cx: cx,
                    cy: cy,
                    r: 5,
                    fill: "red"
                });

            tooltip.transition()
                .duration(1000)
                .style("opacity", 1)
                .style("left", cx)
                .style("top", cy + 10);

            tooltip.html(buildStationTooltip(station));
        }

        var plotMap = function(mapFile) {

            hideTooltip();

            if (svg) {
                svg.selectAll("*").remove();
            }

            if (!mapFile) {
                return;
            }

            var w = 900;
            var h = 600;

            //Load in GeoJSON data
            var geoFile = "data/" + mapFile;

            d3.json(geoFile, function(json) {

                var bounds = helperServices.getBoundsOfFeatures(json.features);
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

                var padding = 30;

                lngScale = d3.scale
                    .linear()
                    .domain([minLng, maxLng])
                    .range([padding,w-padding]);

                latScale = d3.scale
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

                //Create SVG element if we haven't already
                if (!svg) {
                    svg = d3.select("#svgContainer").append("svg").attr({width:w, height: h});
                }

                //Bind data and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill","#666666")
                    .attr("stroke", "black");
            });
        };

    });
