angular.module("train")
    .controller("TrainScatterController", function($scope, trainServices, helperServices, cacheServices) {
        $scope.title = "Train Scatter";

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
                var stops = _.flatten($scope.trains, function(train){
                    return _.map(train.stops, function(stop){
                        stop.train = train;
                        return stop;
                    });
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
            var rBig = 100;

            var xMarginLeft = 100;
            var xMarginRight = 50;
            var yMarginTop = 10;
            var yMarginBottom = 50;
            var transitionTime = 500;


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

            var tooltipHtml = function(d) {
                return "Station " + cacheServices.stationName(d.station) +
                    "<br/>Train: " + d.train.description;
            };

            var svg = d3.select("div#container")
                .append("svg")
                .attr({
                    width: w,
                    height: h
                });

            var tooltip = d3.select("div#container")
                .append("div")
                .attr("id", "tooltip")
                .style({
                    opacity: 0,
                    left: 0,
                    top: 0
                });

            var nodes = svg.selectAll('circle')
                .data(stops)
                .enter()
                .append('g')
                .attr("transform", function(d, i) {
                    // Set d.x and d.y here so that other elements can use it. d is
                    // expected to be an object here.
                    d.x = MapStationToXValue(d.station);
                    d.y = MapTimeToYValue(d.time);
                    return "translate(" + d.x + "," + d.y + ")";
                });

            nodes.append('circle')
                .attr({
                    //cx: function(d) { return MapStationToXValue(d.station);},
                    //cy: function(d) { return MapTimeToYValue(d.time);},
                    r: r,
                    fill: "red",
                    stroke: "black"
                });

            var BuildHtmlTooltip = function (d) {
                return "The <a href='/#/trains/" + d.train.number + "'>" +
                    d.train.description + "</a> arrives at " +
                    cacheServices.stationName(d.station) + " at " +
                    helperServices.formatTime(d.time);
            };

            nodes.on("mouseover", function(d){
                var g = d3.select(this);
                var circle = g.select("circle");
                circle
                    .transition()
                    .duration(transitionTime)
                    .attr({
                        r: rBig
                    });

                tooltip.html(BuildHtmlTooltip(d));

                tooltip.transition()
                    .duration(3 * transitionTime)
                    .style("opacity", .9)
                    .style("left", d3.event.pageX - 65)
                    .style("top", d3.event.pageY - 25);
            })
            .on("mouseout", function(d) {
                    var g = d3.select(this);
                    var circle = g.select("circle");
                    circle
                        .transition()
                        .duration(transitionTime)
                        .attr({
                            r: r
                        });
                    tooltip.transition()
                        .duration(2 * transitionTime)
                        .style({
                            left: 0,
                            top: 0,
                            opacity: 0
                        });
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
                .tickValues(_.map(_.range(23), function(i){
                    var SixAm = 6 * 3600 * 1000;
                    var utcOffset = 5;
                    return SixAm + (i + utcOffset) * 3600000;
                }))
                .tickFormat(function(msSeconds){
                    var m = moment(msSeconds);
                    return m.format("hh:mm A");

                })
                .orient("left");

            var yAxis = svg.append("g").call(yAxisGen)
                .attr("class","axis")
                .attr("transform", "translate(" + 80 + ",0)");
        };
    });
