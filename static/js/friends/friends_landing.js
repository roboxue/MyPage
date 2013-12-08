/**
 * Created with PyCharm.
 * User: roboxue
 * Date: 12/8/13
 * Time: 12:17 AM
 * To change this template use File | Settings | File Templates.
 */
var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;


var barchartPaddingLeft = 5, barchartWidth = 250, barchartRowHeight = 25, barchartRowPadding = 10;
var heatmapUnit = 36, heatmapPadding = 4;

//Barchart prepare
var barchart = d3.select("#barchart").append("svg")
    .attr("height", (barchartRowHeight + barchartRowPadding) * characters.length)
    .attr("width", barchartPaddingLeft + barchartWidth);

barchart.selectAll("rect").data(characters).enter()
    .append("rect");
barchart.selectAll("text").data(characters).enter()
    .append("text");

//Heatmap prepare
var heatmap = d3.select("#heatmap").append("svg")
    .attr({"height": (characters.length + 1) * heatmapUnit + characters.length * heatmapPadding,
        "width": (characters.length + 1) * heatmapUnit + characters.length * heatmapPadding});

heatmap.append("g").selectAll("text").data(d3.range(characters.length)).enter()
    .append("text")
    .attr("x", function (d) {
        return (d + 1) * (heatmapUnit + heatmapPadding);
    })
    .attr("y", heatmapUnit / 2)
    .attr("dy", "0.5em")
    .text(function (d) {
        return characters[d].substring(0, 2);
    });

heatmap.append("g").selectAll("text").data(d3.range(characters.length)).enter()
    .append("text")
    .attr("y", function (d) {
        return (d + 1) * (heatmapUnit + heatmapPadding) + heatmapUnit / 2;
    })
    .attr("x", 0)
    .attr("dy", "0.5em")
    .text(function (d) {
        return characters[d].substring(0, 2);
    });

heatmap.selectAll("g.heatmaptile").data(d3.range(characters.length)).enter()
    .append("g")
    .attr("class", "heatmaptile")
    .attr("transform", function (d) {
        return "translate(" + (heatmapUnit + heatmapPadding) + "," + (heatmapUnit + heatmapPadding) * d + ")";
    })
    .selectAll("rect").data(d3.range(characters.length)).enter()
    .append("rect")
    .attr("transform", function (d) {
        return "translate(" + d * (heatmapUnit + heatmapPadding) + "," + heatmapUnit + ")";
    })
    .attr({"width": heatmapUnit, "height": heatmapUnit})
    .attr("fill", "none")
    .append("title");


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
    talkative_stat.append("span").text("The most talkative character is ");
    talkative_stat.append("span").text(most_talkative_character).attr("class", most_talkative_character);
}

function updateHeatmap(season) {
    var matrix = getMatrix(season);
    var quantize = d3.scale.quantize()
        .domain([15, 25])
        .range(d3.range(5).map(function (i) {
            return "q" + i + "-5";
        }));
    var tiles = heatmap.selectAll("g.heatmaptile").data(getMatrix(season))
        .selectAll("rect").data(function (d, c) {
            var sum = d3.sum(d);
            for (var i = 0; i < d.length; i++) {
                d[i] = {"value": d[i] * 100 / sum, "index": c};
            }
            return d;
        })
        .attr("class", function (d) {
            return d.value == 0 ? "" : quantize(d.value);
        });
    tiles.selectAll("title").remove();
    tiles.append("title").text(function (d,i) {
        return characters[d.index] + "-->" + characters[i] + ":" + Math.round(d.value) + "%";
    });

    var audience_stat = d3.select("#audience_stat");
    audience_stat.selectAll("p").remove();
    audience_stat.append("p").text(season==0?"All seasons":("Season "+season));

    for (var i = 0; i < characters.length; i++) {
        var best_audience = characters[matrix[i].indexOf(d3.max(matrix[i]))];
        audience_stat
            .append("p")
            .append("span").text(characters[i] + "<--")
            .append("span").text(best_audience).attr("class", best_audience);

    }

}

function setSeason(season) {
    console.log(season);
    updateBarChart(season);
    updateHeatmap(season);
    d3.select("#currentSeason").text(season == 0 ? "All Seasons" : "Season " + season).append("span").attr("class", "caret");
}

function getMatrix(season) {
    var matrix = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
    ];
    for (var i = 0; i < acts.length; i++) {
        if (season == 0 || acts[i].season == season) {
            var charactersInAct = acts[i].actualCharacters;
            if (charactersInAct.length > 1) {
                for (var j = 0; j < charactersInAct.length; j++)
                    for (var k = 0; k < charactersInAct.length; k++)
                        if (k != j)
                            matrix[getCharacterId(charactersInAct[j].name)][getCharacterId(charactersInAct[k].name)] += charactersInAct[j].value;
            }
        }
    }
    return matrix
}

function getCharacterId(name) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i] == name)
            return i;
    }
    return null;
}

//Start Visualization
setSeason(0);
