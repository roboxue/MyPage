var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;

d3.select("#season_selector").selectAll("li").data(d3.range(seasonsAvailable + 1))
    .enter()
    .append("li").attr("role", "presentation")
    .append("a").attr("role", "menuitem").attr("href", "#")
    .style("cursor", "pointer")
    .text(function (d) {
        return d == 0 ? "All Seasons" : "Season " + d;
    }).on("click", function (d) {
        updateBarChart(d);
        updateChordChart(d);
        updateHeatmap(d);
        d3.select("#currentSeason").text(d == 0 ? "All Seasons" : "Season " + d).append("span").attr("class", "caret");
    });

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

var chordWidth = 700, chordHeight = 600, innerRadius = Math.min(chordWidth, chordHeight) * 0.35,
    outerRadius = innerRadius * 1.1;
var barchartPaddingLeft = 5, barchartWidth = 125, barchartRowHeight = 25, barchartRowPadding = 5;
var heatmapUnit = 18, heatmapPadding = 2;

var fill = d3.scale.ordinal()
    .domain(d3.range(6))
    .range(charactersColor);

var svg = d3.select("#chord").append("svg")
    .attr("width", chordWidth)
    .attr("height", chordHeight)
    .append("g")
    .attr("transform", "translate(" + chordWidth / 2 + "," + chordHeight / 2 + ")");

var names = svg.append("g").selectAll("text.character").data(characters)
    .enter().append("text").attr("class", "character")
    .style("text-anchor", "middle")
    .text(function (d) {
        return d;
    });

var docks = svg.append("g");
docks.selectAll("path")
    .data(d3.range(characters.length))
    .enter().append("path")
    //Defining the color
    .style("fill", function (d) {
        return fill(d);
    })
    .style("stroke", function (d) {
        return fill(d);
    })
    .on("mouseover", fade(.1))
    .on("mouseout", fade(1))
    .append("title");

var chords = svg.append("g").attr("class", "chord");
chords.selectAll("path").data(d3.range(characters.length * (characters.length - 1) / 2)).enter()
    .append("path")
    .style("fill", function (d, i) {
        return "url(#pattern" + i + ")";
    })
    .append("title");

var defs = chords.selectAll("defs").data(d3.range(characters.length * (characters.length - 1) / 2)).enter().append("defs");

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


function groupTicks(d) {
    //%5 ticks
    var k = (d.endAngle - d.startAngle) / 10;
    return d3.range(1, 11).map(function (v) {
        return {
            "angle": v * k + d.startAngle,
            //Only multiples of 5k
            "label": v % 2 ? null : (v * 10) + "%"
        };
    });
}

function fade(opacity) {
    return function (g, i) {
        svg.selectAll(".chord path")
            .filter(function (d) {
                return d.source.index != i && d.target.index != i;
            })
            .transition()
            .style("opacity", opacity);
    };
}

updateChordChart(0);
updateBarChart(0);
updateHeatmap(0);

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


function updateChordChart(season) {
    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.ascending)
        .matrix(getMatrix(season));
    names.data(chord.groups)
        .transition().duration(500)
        .attr("transform", function (d) {
            return "translate(" + (outerRadius + 70) * Math.sin((d.startAngle + d.endAngle) / 2) + "," + (-70 - outerRadius) * Math.cos((d.startAngle + d.endAngle) / 2) + ")";
        });

//All the curves representing each characters
    docks.selectAll("path").data(chord.groups)
        .transition().duration(500)
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));
    docks.selectAll("title").data(chord.groups)
        .text(function (d) {
            return characters[d.index] + " was heard by " + parseInt(d.value) + " audiences";
        });

    svg.select("#ticks").remove();
    var ticks = svg.append("g").attr("id", "ticks").selectAll("g")
        .data(chord.groups)
        .enter().append("g").selectAll("g").data(groupTicks)
        .enter().append("g")
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + outerRadius + ",0)";
        });

    ticks.append("line")
        .attr({"x1": 1, "y1": 0, "x2": 5, "y2": 0})
        .style("stroke", "#000000");

    ticks.append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            //If more than half circle, flip it
            return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
        })
        .style("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .text(function (d) {
            return d.label;
        });

//The chord curves that connects two characters
    defs.selectAll("linearGradient").remove();
    defs.selectAll("linearGradient").data(chord.chords).enter()
        .append("linearGradient")
        .attr("id", function (d, i) {
            return "pattern" + i;
        })
        .attr("y1", function (d) {
            var cosa = Math.cos((d.source.startAngle + d.source.endAngle) / 2);
            var cosb = Math.cos((d.target.startAngle + d.target.endAngle) / 2);
            if (cosa == d3.min([0, cosa, cosb])) {
                return 0;
            } else if (cosa == d3.max([0, cosa, cosb])) {
                return 1;
            } else {
                return cosa / cosb;
            }
        })
        .attr("x2", function (d) {
            var sina = Math.sin((d.source.startAngle + d.source.endAngle) / 2);
            var sinb = Math.sin((d.target.startAngle + d.target.endAngle) / 2);
            if (sina == d3.min([0, sina, sinb])) {
                return 0;
            } else if (sina == d3.max([0, sina, sinb])) {
                return 1;
            } else {
                return sina / sinb;
            }
        })
        .attr("x1", function (d) {
            var sina = Math.sin((d.source.startAngle + d.source.endAngle) / 2);
            var sinb = Math.sin((d.target.startAngle + d.target.endAngle) / 2);
            if (sinb == d3.min([0, sina, sinb])) {
                return 0;
            } else if (sinb == d3.max([0, sina, sinb])) {
                return 1;
            } else {
                return sinb / sina;
            }
        })
        .attr("y2", function (d) {
            var cosa = Math.cos((d.source.startAngle + d.source.endAngle) / 2);
            var cosb = Math.cos((d.target.startAngle + d.target.endAngle) / 2);
            if (cosb == d3.min([0, cosa, cosb])) {
                return 0;
            } else if (cosb == d3.max([0, cosa, cosb])) {
                return 1;
            } else {
                return cosb / cosa;
            }
        })
        .selectAll("stop")
        .data(function (d) {
            return [d.target, d.source];
        })
        .enter()
        .append("stop")
        .attr("offset", function (d, i) {
            return i;
        })
        .style("stop-color", function (d) {
            return fill(d.index);
        })
        .style("stop-opacity", 1);


    chords.selectAll("path").data(chord.chords)
        .transition().duration(500)
        .attr("d", d3.svg.chord().radius(innerRadius));
    chords.selectAll("path").selectAll("title").data(chord.chords)
        .text(function (d) {
            return characters[d.source.index] + "-->" + characters[d.target.index] + ":" + d.source.value + "\r\n" +
                characters[d.target.index] + "-->" + characters[d.source.index] + ":" + d.target.value;
        });
}


function updateHeatmap(season) {
    var matrix = getMatrix(season);
    var quantize = d3.scale.quantize()
        .domain([15, 25])
        .range(d3.range(5).map(function (i) {
            return "q" + i + "-5";
        }));
    var tiles = heatmap.selectAll("g.heatmaptile").data(matrix)
        .selectAll("rect").data(function (d) {
            var sum = d3.sum(d);
            for (var i = 0; i < d.length; i++) {
                d[i] = d[i] * 100 / sum;
            }
            return d;
        })
        .attr("class", function (d) {
            return d == 0 ? "" : quantize(d);
        });
    tiles.selectAll("title").remove();
    tiles.append("title").text(function (d) {
        return Math.round(d) + "%";
    });

    var audience_stat = d3.select("#audience_stat");
    audience_stat.selectAll("span").remove();
    for (var i = 0; i < characters.length; i++) {
        var best_audience = characters[matrix[i].indexOf(d3.max(matrix[i]))];
        audience_stat
            .append("p")
            .append("span").text(characters[i] + "<--")
            .append("span").text(best_audience).attr("class", best_audience);

    }

}