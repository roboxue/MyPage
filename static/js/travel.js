var width = 600, height = 600;
var projection = d3.geo.mercator()
    .center([13.4, 55])
    .scale(450)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

queue().defer(d3.json, "/static/eu_countries.json")
    .defer(d3.json, "/static/eu_cities.json")
    .await(function (error, countries, cities) {
        var svg = d3.select("#europe").append("svg").attr({"width": width, "height": height});
        var g = svg.append("g");
        var rad = g.append("defs").append("radialGradient").attr({"id": "gradient", "cx": "50%", "cy": "50%", "r": "50%", "fx": "50%", "fy": "50%"});
        rad.append("stop").attr({"offset": "0%", "style": "stop-color:rgb(0,0,255);stop-opacity:0"});
        rad.append("stop").attr({"offset": "100%", "style": "stop-color:rgb(255,255,255);stop-opacity:1"});
        g.append("rect").attr({"width": width, "height": height}).attr("id", "map-background");

//Draw Countries
        g.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .on("click", map_clicked)
            .append("title")
            .text(function (d) {
                return d.properties.NAME;
            });
//Draw Routes
        var route = [];
        for (var i = 0; i < cities.features.length; i++) {
            if (i != 0) {
                route.push({
                    "type": "Feature",
                    "geometry": {"type": "LineString", "coordinates": [cities.features[i - 1].geometry.coordinates, cities.features[i].geometry.coordinates]}});
            }
        }
        g.append("g").attr("id", "route").selectAll(".route")
            .data(route)
            .enter().append("path")
            .attr("class", "route")
            .attr("d", path);

//Create group for each country
        g.selectAll(".country_mark")
            .data(countries.features)
            .enter()
            .append("g")
            .attr("class", ".country_mark")
            .attr("id", function (d) {
                return d.properties.NAME;
            })
            .attr({"pointerEvents": "none"});

//Draw Cities
        var scandinavia = {"Sweden": 1, "Norway": 1, "Finland": 1};
        for (var i = 0; i < cities.features.length; i++) {
            var city = d3.select("#" + cities.features[i].properties.Country)
                .append("path")
                .datum(cities.features[i])
                .attr("class", "city")
                .attr({"d": function (d) {
                    if (d3.select("#" + d.properties.Country).datum().properties.NAME in scandinavia) {
                        return path.pointRadius(2)(d);
                    } else {
                        return path.pointRadius(1)(d);
                    }
                }, "pointer-events": "none"});

            d3.select("#" + cities.features[i].properties.Country).append("text")
                .datum(cities.features[i])
                .attr("class", "city-label")
                .attr("font-size", function (d) {
                    if (d3.select("#" + d.properties.Country).datum().properties.NAME in scandinavia) {
                        return "8";
                    } else {
                        return "4";
                    }
                })
                .attr("y", function (d) {
                    if (d3.select("#" + d.properties.Country).datum().properties.NAME in scandinavia) {
                        return "6";
                    } else {
                        return "2";
                    }
                })
                .attr("transform", function (d) {
                    return "translate(" + projection(d.geometry.coordinates) + ")";
                })
                .attr("dy", ".35em")
                .text(function (d) {
                    return d.properties.Name;
                });
        }


        g.selectAll(".city-label")
            .style({"text-anchor": "middle", "display": "none"});

        var centered;

        function map_clicked(d) {
            var x, y, k;
            $(".city-label").hide();
            if (d && centered !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                if (d.properties.NAME in scandinavia) {
                    k = 2;
                } else {
                    k = 5;
                }
                centered = d;
                $("#" + d.properties.NAME + " .city-label").show();

            } else {
                x = width / 2;
                y = height / 2;
                k = 1;
                centered = null;
            }

            g.selectAll(".country")
                .classed("map-active", centered && function (d) {
                    return d === centered;
                });

            g.transition()
                .duration(500)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");

        }

//Draw Country Name
        g.selectAll(".country-label")
            .data(countries.features)
            .enter().append("text")
            .attr("class", function (d) {
                return d.properties.NAME in scandinavia ? "country-label scandinavia" : "country-label";
            })
            .attr("transform", function (d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function (d) {
                return d.properties.NAME;
            });

    });
