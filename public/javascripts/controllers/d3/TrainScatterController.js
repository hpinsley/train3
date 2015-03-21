angular.module("train")
    .controller("TrainScatterController", function($scope, trainServices, helperServices) {
        $scope.title = "Train Scatter";

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
                var stops = _.flatten($scope.trains, function(train){
                    return train.stops;
                });
                plotStops(stops);
            });

        function GetStationList(stops) {
            var stations = _.map(stops, function(stop) { return stop.station}).sort();
            return _.unique(stations, true);
        }
        function ComputeTimeScale(stops, h, yMarginTop, yMarginBottom) {
            var maxStop = _.max(stops, function (stop) {
                return helperServices.translateZuluString(stop.time);
            });
            var maxStopTime = helperServices.translateZuluString(maxStop.time);

            var minStop = _.min(stops, function (stop) {
                return helperServices.translateZuluString(stop.time);
            });
            var minStopTime = helperServices.translateZuluString(minStop.time);

            var timeScale = d3.scale
                .linear()
                .domain([minStopTime, maxStopTime])
                .range([h - yMarginBottom, yMarginTop]);

            return timeScale;
        }

        var plotStops = function(stops) {
            var w = 1000;
            var h = 500;
            var r = 5;

            var xMarginLeft = 100;
            var xMarginRight = 50;
            var yMarginTop = 10;
            var yMarginBottom = 50;

            var stationList = GetStationList(stops);

            function stationIndex(station) {
                return _.findIndex(stationList, function(tgtStation){
                    return station === tgtStation;
                });
            };

            var timeScale = ComputeTimeScale(stops, h, yMarginTop, yMarginBottom);
            var stationScale = d3.scale
                .linear()
                .domain([0, stationList.length - 1])
                .range([xMarginLeft,w-xMarginRight]);

            var MapStationToXValue = function(station) {
                var index = stationIndex(station);
                return stationScale(index);
            };

            var MapTimeToYValue = function(zTime) {
                var time = helperServices.translateZuluString(zTime);
                return timeScale(time);
            };

            _.each(stationList, function(station){
                console.log("Station " + station + " will be placed at " + MapStationToXValue(station));
            });
//            _.each(stops, function(stop) {
//                console.log("Stop at " + stop.station + " at " +
//                    stop.time + " maps to " + timeScale(helperServices.translateZuluString(stop.time)));
//            });


            //var svg = d3.select("svg");

            var tooltip = d3.select("div#container").append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

            var svg = d3.select("div#container")
                .append("svg")
                .attr({
                    width: w,
                    height: h
                });


            svg.selectAll('circle')
                .data(stops)
                .enter()
                .append('circle')
                .attr({
                    cx: function(d) { return MapStationToXValue(d.station);},
                    cy: function(d) { return MapTimeToYValue(d.time);},
                    r: r,
                    fill: "red"
                })
                .on("mouseover", function(d){
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", .9);
                    tooltip.html("<strong>Station: " + d.station + "</strong>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            var xAxisGen = d3.svg.axis().scale(stationScale)
                .ticks(stationList.length)
                .tickFormat(function(i){
                    return stationList[i];
                })
                .orient("bottom");

            var xAxis = svg.append("g").call(xAxisGen)
                .attr("class","axis")
                .attr("transform", "translate(0," + (h - 50) + ")");

            xAxis.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)"
                });

            var yAxisGen = d3.svg.axis()
                .scale(timeScale)
                .tickFormat(function(seconds){
                    var m = moment(seconds);
                    return m.format("hh:mm A");

                })
                .orient("left");

            var yAxis = svg.append("g").call(yAxisGen)
                .attr("class","axis")
                .attr("transform", "translate(" + 80 + ",0)");
        };
    });
