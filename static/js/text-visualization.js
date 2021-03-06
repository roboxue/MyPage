var width = 900, height = 600;
var projection = d3.geo.mercator()
    .center([10, 40])
    .scale(140)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var country_lookup = d3.map();

var topicNames = ["Aegean Sea", "German", "Portugal", "Arab", "Spain", "Britain", "Russia", "France", "Generic words", "South of Sahara"];
queue().defer(d3.json, "/static/world_countries.json")
    .defer(d3.json, "/static/topic-word.json")
    .defer(d3.csv, "/static/wiki-capitals-topic-visualization.csv")
    .await(function (error, countries, topic, cities) {
        for (var i = 0; i < cities.length; i++) {
            country_lookup.set(cities[i]["country_name"],
                [parseInt(cities[i]["topic1"]), parseInt(cities[i]["topic2"]), parseInt(cities[i]["topic3"]),
                    parseInt(cities[i]["topic4"]), parseInt(cities[i]["topic5"]), parseInt(cities[i]["topic6"]),
                    parseInt(cities[i]["topic7"]), parseInt(cities[i]["topic8"]), parseInt(cities[i]["topic9"]),
                    parseInt(cities[i]["topic10"])]);
        }
        d3.select("#topicList").append("li").attr("role", "presentation").append("a").attr("role", "menuitem")
            .attr("href", "#")
            .on("click", distribution)
            .text("Topic Distribution");

        d3.select("#topics").append("ul").attr("class", "list-group").attr("id", "legend")
            .selectAll("li").data(topicNames).enter().append("li")
            .on("click", function (d) {
                update(topicNames.indexOf(d));
            }).attr("class",function (d) {
                return "list-group-item topic"+topicNames.indexOf(d);
            }).text(function (d) {
                if(d==topicNames[8])
                    return d+"(Not displayed on map)";
                return d;
            });

        d3.select("#topicList").selectAll("li .topicList").data(topic).enter()
            .append("li").attr("class", "topicList").attr("role", "presentation").append("a").attr("role", "menuitem")
            .attr("href", "#")
            .on("click", function (d) {
                update(d.id);
            })
            .text(function (d) {
                return "Topic " + (d.id + 1) + ": " + topicNames[d.id];
            });

        d3.select("#topics").selectAll("ul .topics").data(topic).enter()
            .append("ul").attr("class", "list-group topics").attr("id",function (d) {
                return "topic" + (d.id + 1);
            }).selectAll("li").data(function (d) {
                return d.words;
            }).enter().append("li").attr("class", "list-group-item").text(function (d) {
                return d;
            });

        var svg = d3.select("#world").append("svg").attr({"width": width, "height": height});
        var g = svg.append("g");
        g.append("rect").attr({"width": width, "height": height}).attr("id", "map-background");

//Draw Countries
        g.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .append("title");
        distribution();

    });

function distribution() {
    $("#topics ul").hide();
    $("#legend").show();
    d3.select("#currentTopic").text("Topic Distribution");
    var g = d3.select("g");
    g.selectAll("path.country")
        .attr("class", function (d) {
            if (!country_lookup.has(d.properties.NAME_12))
                return "country";
            //Remove Politics category
            var array=country_lookup.get(d.properties.NAME_12);
            var temp=array[8];
            array[8]=0;
            var result= "country " + "topic" + array.indexOf(d3.max(array));
            array[8]=temp;
            return result;
        });

    g.selectAll("path.country title")
        .text(function (d) {
            var name = d.properties.NAME_12;
            if (!country_lookup.has(name))
                return name;
            var array=country_lookup.get(name);
            //Remove Politics category
            var temp=array[8];
            array[8]=0;
            var result= name + ":" + topicNames[array.indexOf(d3.max(array))];
            array[8]=temp;
            return result;
        });
}

function update(topicId) {
    $("#topics ul").hide();
    $("#topic" + (topicId + 1)).show();
    d3.select("#currentTopic").text("Topic" + (topicId + 1) + ": " + topicNames[topicId]);
    var quantize = d3.scale.quantize()
        .domain([d3.min(country_lookup.values(), function (d) {
            return d[topicId]
        }), d3.max(country_lookup.values(), function (d) {
            return d[topicId];
        })])
        .range(d3.range(9).map(function (i) {
            return "q" + i + "-9";
        }));
    var g = d3.select("g");
    g.selectAll("path.country")
        .attr("class", function (d) {
            if (country_lookup.get(d.properties.NAME_12) == undefined)
                return "country";
            return "country " + quantize(country_lookup.get(d.properties.NAME_12)[topicId]);
        });

    g.selectAll("path.country title")
        .text(function (d) {
            return country_lookup.get(d.properties.NAME_12) == undefined ? d.properties.NAME_12 : (d.properties.NAME_12 + ":" + country_lookup.get(d.properties.NAME_12)[topicId]);
        });
}
