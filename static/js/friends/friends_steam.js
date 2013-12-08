var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;
var episodesAvailable = [24, 23, 25, 23, 23, 23, 23, 23];

function activityStatByCharacter(characterId) {
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

var barchartPaddingLeft = 5, barchartWidth = 125, barchartRowHeight = 25, barchartRowPadding = 5;
var n = characters.length, // number of layers
    m = d3.sum(episodesAvailable), // number of samples per layer
    stack = d3.layout.stack().offset("wiggle"),
    layers0;

var steamWidth = 800, steamHeight = 300;

//Barchart prepare
var barchart = d3.select("#barchart").append("svg")
    .attr("height", (barchartRowHeight + barchartRowPadding) * characters.length)
    .attr("width", barchartPaddingLeft + barchartWidth);

barchart.selectAll("rect").data(characters).enter()
    .append("rect");
barchart.selectAll("text").data(characters).enter()
    .append("text");

//Steam graph prepare
var color = d3.scale.ordinal()
    .domain(d3.range(6))
    .range(charactersColor);

var x = d3.scale.linear()
    .domain([0, m - 1])
    .range([0, steamWidth]);

var svg = d3.select("#steam").append("svg")
    .attr("width", steamWidth)
    .attr("height", steamHeight);

svg.append("g").selectAll("g").data(episodesAvailable).enter()
    .append("g").attr("transform",function (d, i) {
        var count = 0;
        if (i != 0)
            for (var k = 0; k < i; k++)
                count += episodesAvailable[k];
        return "translate(" + x(count) + "," + steamHeight + ")";
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
    .attr({"width": 1, "height": steamHeight, "x": 0, "y": 0});
indicator.append("rect")
    .attr({"width": 70, "height": 20, "x": -35, "y": steamHeight - 25})
    .style("fill", "#ffffff")
    .style("stroke", "#000000");
indicator.append("text")
    .attr({"dy": "0.5em", "y": steamHeight - 15, "x": 0})
    .style("text-anchor", "middle")
    .style("fill", "#000000");

function getCharacterId(name) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i] == name)
            return i;
    }
    return null;
}

function setSeason(season) {
    console.log(season);
    updateBarChart(season);
    d3.select("#currentSeason").text(season == 0 ? "All Seasons" : "Season " + season).append("span").attr("class", "caret");
}


function showOneCharacter(characterId) {
    layers0 = stack((characterId == n ? d3.range(n) : [characterId]).map(function (d) {
        return activityStatByCharacter(d);
    }));
    var y = d3.scale.linear()
        .domain([0, d3.max(layers0, function (layer) {
            return d3.max(layer, function (d) {
                return d.y0 + d.y;
            });
        })])
        .range([steamHeight, 0]);
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
            characterId == 6 ? showOneCharacter(i) : showOneCharacter(n);
        })
        .append("title")
        .text(function (d, i) {
            return characters[i];
        });
    svg.on("mousemove", function () {
        indicator.attr("transform", "translate(" + (d3.mouse(this)[0] - 1) + ",0)");
        var count = 0, i = 0;
        while (count + episodesAvailable[i] < x.invert(d3.mouse(this)[0]))
            count += episodesAvailable[i++];
        indicator.select("text").text("S" + (i + 1) + "E" + parseInt(x.invert(d3.mouse(this)[0]) + 1 - count));
    })

}

function updateBarChart(season) {
    var talkativeStat = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < acts.length; i++) {
        if (season == 0 || acts[i].season == season) {
            var charactersInAct = acts[i].actualCharacters;
            if (charactersInAct.length > 0)
                for (var j = 0; j < charactersInAct.length; j++)
                    talkativeStat[getCharacterId(charactersInAct[j].name)] += charactersInAct[j].value;
        }
    }
    var talk_record = d3.max(talkativeStat);
    var most_talkative_character = characters[talkativeStat.indexOf(talk_record)];
    barchart.selectAll("rect").data(talkativeStat).attr({"height": barchartRowHeight, "x": barchartPaddingLeft})
        .attr("width", function (d) {
            return barchartWidth * d / talk_record;
        })
        .attr("y", function (d, i) {
            return i * (barchartRowHeight + barchartRowPadding);
        })
        .style("fill", function (d, i) {
            return charactersColor[i];
        });

    barchart.selectAll("text").data(talkativeStat).attr("dy", "0.5em")
        .attr("transform", function (d, i) {
            return "translate(" + (barchartPaddingLeft + 5) + "," + (barchartRowHeight / 2 + i * (barchartRowHeight + barchartRowPadding)) + ")";
        })
        .style("fill", "#ffffff")
        .text(function (d, i) {
            return characters[i] + ": " + d;
        });

    var talkative_stat = d3.select("#talkative_stat");
    talkative_stat.selectAll("span").remove();
    talkative_stat.append("span").text("The most talkative character in "+(season==0?"all seasons":"Season "+ season) +" is ");
    talkative_stat.append("span").text(most_talkative_character).attr("class", most_talkative_character);
}
//Web UI
d3.select("#autoplay").on("click", function () {
    autoplay(1);
    $("#autoplay span").toggleClass("glyphicon-play glyphicon-random");
    d3.select("#autoplay").on("click", void(0));
});
function autoplay(season) {
    if (season >= 0 && season <= seasonsAvailable)
        setSeason(season);
    if (season == 0) {
        $("#autoplay span").toggleClass("glyphicon-play glyphicon-random");
        d3.select("#autoplay").on("click", function () {
            autoplay(1);
            $("#autoplay span").toggleClass("glyphicon-play glyphicon-random");
            d3.select("#autoplay").on("click", void(0));
        });
        return;
    }
    if (season + 1 <= seasonsAvailable)
        setTimeout(function () {
            autoplay(season + 1)
        }, 3000);
    else {
        setTimeout(function () {
            autoplay(0)
        }, 3000);
    }

}

d3.select("#season_selector").selectAll("li").data(d3.range(seasonsAvailable + 1))
    .enter()
    .append("li").attr("role", "presentation")
    .append("a").attr("role", "menuitem").attr("href", "#")
    .style("cursor", "pointer")
    .text(function (d) {
        return d == 0 ? "All Seasons" : "Season " + d;
    }).on("click", function (d) {
        setSeason(d);
    });
//Display Visuals
showOneCharacter(n);
setSeason(0);