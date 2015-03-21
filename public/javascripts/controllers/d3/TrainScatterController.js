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
            var w = $("svg")[0].clientWidth;
            var h = $("svg")[0].clientHeight;
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
            var svg = d3.select("svg");
            svg.selectAll('circle')
                .data(stops)
                .enter()
                .append('circle')
                .attr({
                    cx: function(d) { return MapStationToXValue(d.station);},
                    cy: function(d) { return MapTimeToYValue(d.time);},
                    r: r,
                    fill: "red",
                    title: function(d) { return "Stop at " + d.station;}
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

        var plotStationData = function(stats) {
            var svg = d3.select("svg");
            var width = $("svg")[0].clientWidth;
            var height = $("svg")[0].clientHeight;
            var stationCount = stats.length;
            var xBarPadding = 50;
            var yBarPaddingTop = 30;
            var yBarPaddingBottom = 140;
            var yAxisPadding = 40;
            var barLabelPadding = 5;
            var barWidth = 10;
            var maxTrains = _.max(stats, function(stat){ return stat.trainCount; }).trainCount;
            var yScale = d3.scale
                .linear()
                .domain([0,maxTrains])
                .range([height-yBarPaddingBottom, yBarPaddingTop]);
            var xScale = d3.scale
                .linear()
                .domain([0, stationCount-1])
                .range([xBarPadding, width - xBarPadding]);

            var yAxisGen = d3.svg.axis().scale(yScale).orient("left");
            var xAxisGen = d3.svg.axis().scale(xScale)
                .ticks(stats.length)
                .tickFormat(function(i){
                    return stats[i].station.name;
                })
                .orient("bottom");

            var yAxis = svg.append("g").call(yAxisGen)
                .attr("class","axis")
                .attr("transform", "translate(" + yAxisPadding + ",0)");

            var xAxis = svg.append("g").call(xAxisGen)
                .attr("class","axis")
                .attr("transform", "translate(0," + (height - yBarPaddingBottom) + ")");

            xAxis.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)"
                });

            svg.selectAll('rect.bar')
                .data(stats)
                .enter()
                .append('rect')
                .attr({
                    class: "bar",
                    x: function(d,i) { return xScale(i);},
                    y: function(d) { return yScale(d.trainCount);},
                    width: function() { return barWidth;},
                    height: function(d) { return height - yBarPaddingBottom - yScale(d.trainCount);}
                });

            svg.selectAll('text.barLabel')
                .data(stats)
                .enter()
                .append('text')
                .text(function(d) { return d.trainCount; })
                .attr({
                    class: "barLabel",
                    x: function(d,i) { return xScale(i);},
                    y: function(d) { return yScale(d.trainCount) - barLabelPadding;}
                });
        }
    });
