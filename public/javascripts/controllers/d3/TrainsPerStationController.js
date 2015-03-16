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
