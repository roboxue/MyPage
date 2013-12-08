var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;
var episodesAvailable = [24, 23, 25, 23, 23, 23, 23, 23];

function getCharacterId(name) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i] == name)
            return i;
    }
    return null;
}

function updateSteamChart(season) {

}


var n = characters.length, // number of layers
    m = d3.sum(episodesAvailable), // number of samples per layer
    stack = d3.layout.stack().offset("wiggle"),
    layers0;

var width = 800,
    height = 300;

var color = d3.scale.ordinal()
    .domain(d3.range(6))
    .range(charactersColor);


var svg = d3.select("#steam").append("svg")
    .attr("width", width)
    .attr("height", height);

var x = d3.scale.linear()
    .domain([0, m - 1])
    .range([0, width]);

transition(n);
function transition(characterId) {
    layers0 = stack((characterId == n ? d3.range(n) : [characterId]).map(function (d) {
        return bumpLayer(d);
    }));
    var y = d3.scale.linear()
        .domain([0, d3.max(layers0, function (layer) {
            return d3.max(layer, function (d) {
                return d.y0 + d.y;
            });
        })])
        .range([height, 0]);
    var area = d3.svg.area()
        .x(function (d) {
            return x(d.x);
        })
        .y0(function (d) {
            return y(d.y0);
        })
        .y1(function (d) {
            return y(d.y0 + d.y);
        });
    svg.selectAll("path").remove();
    svg.selectAll("path")
        .data(layers0)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function (d, i) {
            return characterId == 6 ? color(i) : color(characterId);
        })
        .on("click", function (d, i) {
            console.log(d);
            characterId == 6 ? transition(i) : transition(n);
        })
        .append("title")
        .text(function (d, i) {
            return characters[i];
        });
    svg.on("mousemove", function () {
        indicator.attr("transform", "translate(" + (d3.mouse(this)[0] - 1) + ",0)");
        var count= 0,i=0;
        while(count+episodesAvailable[i]< x.invert(d3.mouse(this)[0]))
            count+=episodesAvailable[i++];
        indicator.select("text").text("S"+(i+1)+"E"+parseInt(x.invert(d3.mouse(this)[0])+1-count));
    })

}

svg.append("g").selectAll("g").data(episodesAvailable).enter()
    .append("g").attr("transform",function (d, i) {
        var count = 0;
        if (i != 0)
            for (var k = 0; k < i; k++)
                count += episodesAvailable[k];
        return "translate(" + x(count) + "," + height + ")";
    }).selectAll("line").data(function (d) {
        return d3.range(d);
    }).enter()
    .append("line")
    .attr({"x1": 0, "y1": 0, "x2": 0})
    .attr("y2", function (d) {
        return d == 0 ? -10 : -5;
    })
    .attr("transform", function (d, i) {
        return "translate(" + x(i) + ",0)";
    })
    .style("stroke", "#000000");

var indicator = svg.append("g");
indicator.append("rect")
    .attr({"width": 1, "height": height, "x": 0, "y": 0});
indicator.append("rect")
    .attr({"width": 70, "height": 20, "x": -35, "y": height - 25})
    .style("fill", "#ffffff")
    .style("stroke", "#000000");
indicator.append("text")
    .attr({"dy": "0.5em", "y": height-15, "x": 0})
    .style("text-anchor", "middle")
    .style("fill", "#000000");

// Inspired by Lee Byron's test data generator.
function bumpLayer(characterId) {

    var a = [];
    var current_season = 0, current_episode = 0, i = -1;
    for (var act = 0; act < acts.length; act++) {
        if (acts[act].season != current_season || acts[act].episode != current_episode) {
            current_season = acts[act].season;
            current_episode = acts[act].episode;
            i++;
            a[i] = 0;
        }
        if (acts[act].actualCharacters.length > 0)
            for (var j = 0; j < acts[act].actualCharacters.length; j++) {
                if (getCharacterId(acts[act].actualCharacters[j].name) == characterId) {
                    a[i] += acts[act].actualCharacters[j].value;
                    break;
                }
            }
    }

    return a.map(function (d, i) {
        return {x: i, y: Math.max(0, d)};
    });
}
