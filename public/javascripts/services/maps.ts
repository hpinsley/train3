/// <reference path="../../../d.ts/d3.d.ts" />
/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />

module Maps {

    export class LineMap {

        public tooltipOffset: number = 30;
        private svg;        //Wish I could declare this as D3.Svg.Svg.  But it doesn't expose an append method?
        private lngScale: D3.Scale.LinearScale;
        private latScale: D3.Scale.LinearScale;
        private stations: TrainDefs.Station[];  //Filtered by the line and in line order
        private lineFun: D3.Svg.Line;
        private tooltip: D3.Selection;
        private p: angular.IPromise<boolean>;

        constructor(public $q: angular.IQService, public line:TrainDefs.Line, allStations:TrainDefs.Station[], public elementId:string, public w:number, public h:number) {
            var stationList:TrainDefs.Station[] = _.filter(allStations, (station:TrainDefs.Station) => {
                return line.stations.indexOf(station.abbr) >= 0;
            });

            this.stations = _.sortBy(stationList, function(station:TrainDefs.Station) {
                return line.stations.indexOf(station.abbr);
            });

            this.createTooltip();
        }

        private createTooltip() {
            this.tooltip = d3.select("#" + this.elementId)
                .append("div")
                .attr("id", "tooltip")
                .style({
                    opacity: 0,
                    left: 0,
                    top: 0
                });
        }

        private hideTooltip() {
            this.tooltip.style("opacity", 0);
        }

        private erase() {
            d3.select("svg#map").remove();
            this.svg = null;
        }

        public plotMap():angular.IPromise<boolean> {

            var defer = this.$q.defer();


            this.hideTooltip();

            if (this.svg) {
                this.svg.selectAll("*").remove();
            }

            var geoFile = "data/" + this.line.map;
            d3.json(geoFile, function(json) {

                var bounds = getBoundsOfFeatures(json.features);
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

                var padding = 30;

                this.lngScale = d3.scale
                    .linear()
                    .domain([minLng, maxLng])
                    .range([padding,this.w-padding]);

                this.latScale = d3.scale
                    .linear()
                    .domain([minLat, maxLat])
                    .range([this.h-padding,padding]);

                var customProjection:D3.Geo.Projection = <D3.Geo.Projection> function(lngLat) {
                    var lng = lngLat[0];
                    var lat = lngLat[1];
                    var result = [this.lngScale(lng),this.latScale(lat)];
                    return result;
                }.bind(this);

                //Define path generator
                var path = d3.geo.path()
                    .projection(customProjection);

                //Create SVG element if we haven't already
                if (!this.svg) {
                    this.svg = d3.select("#" + this.elementId).append("svg").attr({id:"map", width:this.w, height: this.h});
                }

                this.svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill","#fefefe")
                    .attr("stroke", "black");

                this.lineFun = d3.svg.line()
                    .x(function (station) { return this.lngScale(station.lnglat[0])})
                    .y(function (station) { return this.latScale(station.lnglat[1])})
                    .interpolate("linear");

                defer.resolve(true);

            }.bind(this));

            return defer.promise;
        }

        public showLinePath() {
            var lineGroup = this.svg.append("g").attr("class", "linePath");
            var self = this;
            lineGroup.append("path")
                .attr({
                    d: this.lineFun(this.stations),
                    "stroke": "black",
                    "stroke-width": 3,
                    "fill": "none"
                });

            lineGroup.selectAll("circle.linePathCircle")
                .data(this.stations)
                .enter()
                .append("circle")
                .attr({
                    class: "linePathCircle",
                    cx: function(station) { return self.lngScale(station.lnglat[0]);},
                    cy: function(station) { return self.latScale(station.lnglat[1]);},
                    r: this.h < 300 ? 2 : 5,
                    fill: "blue"
                });
        }

        public removeLinePath() : void {
            if (!this.svg) {
                return;
            }
            this.svg.select("g.linePath").remove();
        }

        public plotStationLoc(station:TrainDefs.Station) {
            var lng = station.lnglat[0];
            var lat = station.lnglat[1];
            var cx = this.lngScale(lng);
            var cy = this.latScale(lat);

            this.svg.selectAll("circle.stopPoint").remove();

            this.svg.append("circle")
                .attr({
                    class: "stopPoint",
                    cx: cx,
                    cy: cy,
                    r: 5,
                    fill: "red"
                });

            this.tooltip.transition()
                .duration(1000)
                .style("opacity", 1)
                .style("left", cx)
                .style("top", cy + this.tooltipOffset);

            this.tooltip.html(this.buildStationTooltip(station));
        }


        private buildStationTooltip (station:TrainDefs.Station) : string {
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
        }
    }

    export function getBoundsOfFeatures(features) {
        for (var i = 0; i < features.length; ++i) {
            var bounds = d3.geo.bounds(features[i]);
            var gbounds;

            if (i == 0) {
                gbounds = [
                    [bounds[0][0],bounds[0][1]],
                    [bounds[1][0],bounds[1][1]]
                ];
            }
            else {
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

                if (minLng < gbounds[0][0])
                    gbounds[0][0] = minLng;
                if (minLat < gbounds[0][1])
                    gbounds[0][1] = minLat;
                if (maxLng > gbounds[1][0])
                    gbounds[1][0] = maxLng;
                if (maxLat > gbounds[1][1])
                    gbounds[1][1] = maxLat;
            }
        }
        return gbounds;
    }

}
