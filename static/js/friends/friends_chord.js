var seasonsAvailable = 8;

d3.select("#season_selector").selectAll("li").data(d3.range(seasonsAvailable + 1))
    .enter().append("li").attr("class", function (d) {
        return d == 0 ? "list-group-item active" : "list-group-item";
    })
    .style("cursor", "pointer")
    .text(function (d) {
        return d == 0 ? "All" : "Season " + d;
    }).on("click", function (d) {
        updateBarChart(d);
        updateChordChart(d);
        $("#season_selector li").removeClass("active");
        $(this).addClass("active");
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

var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
function getCharacterId(name) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i] == name)
            return i;
    }
}

var chordWidth = 700, chordHeight = 600, innerRadius = Math.min(chordWidth, chordHeight) * 0.35,
    outerRadius = innerRadius * 1.1;
var barchartPaddingLeft = 5, barchartWidth = 125, barchartRowHeight = 25, barchartRowPadding = 5;

var fill = d3.scale.ordinal()
    .domain(d3.range(6))
    .range(charactersColor);


var barchart = d3.select("#barchart").append("svg")
    .attr("height", (barchartRowHeight + barchartRowPadding) * characters.length)
    .attr("width", barchartPaddingLeft + barchartWidth);

barchart.selectAll("rect").data(characters).enter()
    .append("rect");
barchart.selectAll("text").data(characters).enter()
    .append("text");

updateChordChart(0);
updateBarChart(0);

function updateBarChart(season) {
    var speakingStat = {"Monica": 0, "Ross": 0, "Rachel": 0, "Joey": 0, "Chandler": 0, "Phoebe": 0};
    for (var i = 0; i < acts.length; i++) {
        if (season == 0 || acts[i].season == season) {
            var charactersInAct = acts[i].actualCharacters;
            if (charactersInAct.length > 0)
                for (var j = 0; j < charactersInAct.length; j++)
                    speakingStat[charactersInAct[j].name] += charactersInAct[j].value;
        }
    }
    barchart.selectAll("rect").data(characters).attr({"height": barchartRowHeight, "x": barchartPaddingLeft})
        .attr("width", function (d) {
            return barchartWidth * speakingStat[d] / d3.max(characters, function (d) {
                return speakingStat[d];
            });
        })
        .attr("y", function (d, i) {
            return i * (barchartRowHeight + barchartRowPadding);
        })
        .style("fill", function (d, i) {
            return charactersColor[i];
        })

    barchart.selectAll("text").data(characters).attr("dy", "0.5em")
        .attr("transform", function (d, i) {
            return "translate(" + (barchartPaddingLeft + 5) + "," + (barchartRowHeight / 2 + i * (barchartRowHeight + barchartRowPadding)) + ")";
        })
        .style("fill", "#ffffff")
        .text(function (d) {
            return d + ": " + speakingStat[d];
        });

}


function updateChordChart(season) {
    var chord = d3.layout.chord()
        .padding(.05)
        .matrix(getMatrix(season));

    d3.select("#chord_chart").remove();
    var svg = d3.select("#chord").append("svg")
        .attr("width", chordWidth)
        .attr("height", chordHeight)
        .attr("id", "chord_chart")
        .append("g")
        .attr("transform", "translate(" + chordWidth / 2 + "," + chordHeight / 2 + ")");

    var names = svg.append("g").selectAll("text.character").data(chord.groups)
        .enter().append("text").attr("class", "character")
        .attr("transform", function (d) {
            return "translate(" + (outerRadius + 70) * Math.sin((d.startAngle + d.endAngle) / 2) + "," + (-70 - outerRadius) * Math.cos((d.startAngle + d.endAngle) / 2) + ")";
        })
        .style("text-anchor", "middle")
        .text(function (d) {
            return characters[d.index];
        })

//All the curves connecting each characters
    var docks = svg.append("g").selectAll("path")
        .data(chord.groups)
        .enter().append("path")
        //Defining the color
        .style("fill", function (d) {
            return fill(d.index);
        })
        .style("stroke", function (d) {
            return fill(d.index);
        })
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));
    docks.append("title")
        .text(function (d) {
            return characters[d.index] + ":" + parseInt(d.value);
        });


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
    var chords = svg.append("g").attr("class", "chord");
    chords.selectAll("defs").data(chord.chords).enter().append("defs").append("linearGradient")
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


    chords.selectAll("path")
        .data(chord.chords)
        .enter().append("path")
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", function (d, i) {
            return "url(#pattern" + i + ")";
        })
        .append("title")
        .text(function (d) {
            return characters[d.source.index] + "-->" + characters[d.target.index] + ":" + d.source.value + "\r\n" +
                characters[d.target.index] + "-->" + characters[d.source.index] + ":" + d.target.value;
        });

    function groupTicks(d) {
        var k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, d.value > 10000 ? 1000 : 100).map(function (v, i) {
            return {
                "angle": v * k + d.startAngle,
                //Only multiples of 5k
                "label": i % 5 ? null : (d.value > 10000 ? (v / 1000 + "k") : (v - v % 100))
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
}


