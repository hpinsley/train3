angular.module("train")
    .controller("TrainsPerStationController", function($scope, trainServices) {
        $scope.title = "Trains Per Station";

        trainServices.getTrains()
            .then(function(res){
                var trains = res.data;
                return trainServices.getStations()
                    .then(function(res){
                        var stations = res.data;
                        return _.map(stations, function(station){
                            var stationTrains = _.filter(trains, function(train){
                                return _.any(train.stops, function(stop){
                                    return stop.station === station.abbr;
                                });
                            });
                            return {
                                station: station,
                                trainCount: stationTrains.length
                            };
                        });
                    });
            })
            .then(function(data){
                //alert(JSON.stringify(data));
                $scope.data = data;
                plotStationData($scope.data)
            });

        var plotStationData = function(stats) {
            var svg = d3.select("svg");
            var width = $("svg")[0].clientWidth;
            var height = $("svg")[0].clientHeight;
            var stationCount = stats.length;
            var xBarPadding = 10;
            var yBarPadding = 20;
            var yAxisPadding = 30;
            var barLabelPadding = 5;

            var firstBarStart = yAxisPadding + xBarPadding;
            var barWidth = (width - firstBarStart) / stationCount;
            var maxTrains = _.max(stats, function(stat){ return stat.trainCount; }).trainCount;
            var yScale = d3.scale
                .linear()
                .domain([0,maxTrains])
                .range([height-yBarPadding, yBarPadding]);

            var yAxis = d3.svg.axis().scale(yScale).orient("left");
            svg.append("g").call(yAxis)
                .attr("class","axis")
                .attr("transform", "translate(" + yAxisPadding + ",0)");

            var barTop = function(trainCount) {
                return yScale(trainCount);
            };
            svg.selectAll('rect.bar')
                .data(stats)
                .enter()
                .append('rect')
                .attr({
                    class: "bar",
                    x: function(d,i) { return firstBarStart + i * barWidth;},
                    y: function(d) { return barTop(d.trainCount);},
                    width: function() { return barWidth - xBarPadding;},
                    height: function(d) { return height - yBarPadding - barTop(d.trainCount);}
                });

            svg.selectAll('text.barLabel')
                .data(stats)
                .enter()
                .append('text')
                .text(function(d) { return d.station.name; })
                .attr({
                    class: "barLabel",
                    x: function(d,i) { return firstBarStart + i * barWidth;},
                    y: function(d) { return barTop(d.trainCount) - barLabelPadding;}
                });
        }
    });
