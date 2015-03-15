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
            var barWidth = width / stationCount;
            var padding = 2;
            var barHeight = function(trainCount) {
                return trainCount * 10;
            };
            svg.selectAll('rect')
                .data(stats)
                .enter()
                .append('rect')
                .attr({
                    x: function(d,i) { return i * barWidth;},
                    y: function(d) { return height - barHeight(d.trainCount);},
                    width: function() { return barWidth - padding;},
                    height: function(d) { return barHeight(d.trainCount);}
                });

            svg.selectAll('text')
                .data(stats)
                .enter()
                .append('text')
                .text(function(d) { return d.station.name; })
                .attr({
                    x: function(d,i) { return i * barWidth;},
                    y: function(d) { return height - barHeight(d.trainCount) - 10;}
                    //transform: function(d) { return "rotate(-65)";}
                });
        }
    });
