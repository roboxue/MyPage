var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;

function getSentimentText(sentimentValue) {
    switch (Math.round(sentimentValue)) {
        case 0:
            return "--";
        case 1:
            return "-";
        case 2:
            return "@";
        case 3:
            return "+";
        case 4:
            return "++";
    }
}
function getSentimentColor(sentimentValue) {
    switch (Math.round(sentimentValue)) {
        case 0:
            return "#B2182B";
        case 1:
            return "#F4A582";
        case 2:
            return "#BDBDBD";
        case 3:
            return "#92C5DE";
        case 4:
            return "#2166AC";
    }
}
var nested_acts = d3.nest()
    .key(function (d) {
        return d.season;
    }).sortKeys(d3.ascending)
    .key(function (d) {
        return d.episode;
    }).sortKeys(function (a, b) {
        return a - b;
    })
    .sortValues(function (a, b) {
        return a.act - b.act;
    })
    .entries(acts);

//Storyline prepare
var storyline = d3.select("#storyline");

var sentimargin = {top: 10, right: 20, bottom: 20, left: 70},
    sentiwidth = 1080 - sentimargin.left - sentimargin.right,
    sentiheight = 100 - sentimargin.top - sentimargin.bottom;

var x = d3.scale.linear()
    .range([0, sentiwidth]);

var y = d3.scale.linear()
    .range([sentiheight, 0]);
var sentitext = d3.scale.ordinal()
    .domain([1.5, 2.5])
    .range(["Negative", "Neutral", "Positive"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickValues([1.5, 2, 2.5])
    .tickFormat(sentitext);

var line = d3.svg.line()
    .x(function (d) {
        return x(d.index);
    })
    .y(function (d) {
        return y(d.sentiment);
    });

var sentiment_trend = d3.select("#season_sentiment_trend").append("svg")
    .attr("width", sentiwidth + sentimargin.left + sentimargin.right)
    .attr("height", sentiheight + sentimargin.top + sentimargin.bottom)
    .append("g")
    .attr("transform", "translate(" + sentimargin.left + "," + sentimargin.top + ")");
x.domain([0, 25]);
y.domain([1.5, 2.5]);

sentiment_trend.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + sentiheight + ")")
    .call(xAxis)
    .append("text")
    .attr("x", sentiwidth)
    .attr("y", -6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Episode");

sentiment_trend.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Sentiment");

//Breadcrumb prepare
var breadcrumb = d3.select("#selector");
var season_selector = breadcrumb.append("li").attr("id", "season_selector").attr("class", "dropdown");
var current_season = season_selector.append("a").attr("class", "dropdown-toggle").attr("href", "#").attr("data-toggle", "dropdown")
season_selector.append("ul").attr("class", "dropdown-menu").selectAll("li").data(d3.range(seasonsAvailable)).enter()
    .append("li").on("click",function (d) {
        selectSeason(d + 1);
    }).append("a").text(function (d) {
        return "Season" + (d + 1);
    });

var episode_selector = breadcrumb.append("li").attr("id", "episode_selector").attr("class", "dropdown");
var current_episode = episode_selector.append("a").attr("class", "dropdown-toggle").attr("href", "#").attr("data-toggle", "dropdown")
episode_selector.append("ul").attr("class", "dropdown-menu");

//Update Breadcrumb
function selectSeason(season) {
    current_season.text("Season " + season).append("span").attr("class", "caret");
    episode_selector.select("ul").selectAll("li").remove();
    episode_selector.select("ul").selectAll("li").data(nested_acts[season - 1].values).enter()
        .append("li").on("click",function (d) {
            selectEpisode(season, d.key);
        }).append("a").attr("href", "#").text(function (d) {
            return "Episode " + d.key + " - " + d.values[0].title;
        });
    selectEpisode(season, 1);
    updateSentimentLine(season);
    updateSentimentLine(season);
}

function selectEpisode(season, episode) {
    current_season.text("Season " + season).append("span").attr("class", "caret");
    var d = nested_acts[season - 1].values[episode - 1];
    while (d.key > episode) {
        episode--;
        d = nested_acts[season - 1].values[episode - 1]
    }
    current_episode.text("Episode " + d.key + " - " + d.values[0].title).append("span").attr("class", "caret");
    updateStoryline(d);
}




function updateStoryline(episode) {
    storyline.selectAll("div.act").remove();
    var act_story = storyline.selectAll("div.act").data(episode.values).enter()
        .append("div").attr({"class": "act list-group"}).append("a").attr({"class": "list-group-item"})
        .on("click", function (d) {
            showscript(d);
        });
    act_story.append("h4").attr({"class": "list-group-item-heading"}).text(function (d) {
        return "Act " + d.act;
    });
    act_story.append("p").attr({"class": "list-group-item-text"}).text(function (d) {
        return d.scene;
    });
    var characters_in_act = act_story.append("p").attr("class", "list-group-item-text").selectAll("span.label").data(function (d) {
        v = [];
        for (var i = 0; i < d.actualCharacters.length; i++) {
            v[i] = {"name": d.actualCharacters[i].name, "sentences": d.actualCharacters[i].value,
                "sentiment": d.sentiments[i].value / d.actualCharacters[i].value};
        }
        return v;
    }).enter()
        .append("span").text(function (d) {
            return d.name;
        }).attr("class", function (d) {
            return "label " + d.name;
        })
        .on("mouseover", function (d) {
            sentiment_trend.selectAll("g.series path").style("stroke", function (v, i) {
                return d.name == characters[i] ? charactersColor[i] : "none";
            });
        })
        .on("mouseout",function () {
            sentiment_trend.selectAll("g.series path").style("stroke", function (v, i) {
                return charactersColor[i];
            });
        }).append("span").attr("class", "badge").style("background-color",function (d) {
            return getSentimentColor(d.sentiment);
        }).text(function (d) {
            return getSentimentText(d.sentiment);
        });
    showscript(episode.values[0]);

}

function showscript(act) {
    d3.json("/data/friends/" + act.season + "/" + act.episode + "/" + act.act + "", function (data) {
        d3.select("#scriptdisplay").selectAll("div").remove();
        var scriptdisplay = d3.select("#scriptdisplay").append("div");
        scriptdisplay.append("h3").text("Season " + act.season + " Episode " + act.episode + " Act " + act.act);
        if (act.scene != null)
            scriptdisplay.append("h2").text("Scene description: " + act.scene);
        var dialogues = scriptdisplay.selectAll("p").data(data).enter()
            .append("p");
        dialogues.append("span").attr("class", function (d) {
            return d.speaker;
        })
            .text(function (d) {
                return d.speaker + ":";
            })
            .on("mouseover", function (d) {
                sentiment_trend.selectAll("g.series path").style("stroke", function (v, i) {
                    return d.speaker == characters[i] ? charactersColor[i] : "none";
                });
            })
            .on("mouseout",function (d) {
                sentiment_trend.selectAll("g.series path").style("stroke", function (v, i) {
                    return charactersColor[i];
                });
            }).append("span").attr("class", "badge").style("background-color", function (d) {
                return getSentimentColor(d.sentiment);
            });
        dialogues.append("span").text(function (d) {
            return d.content;
        })
    });
}

function updateSentimentLine(season) {
    var sentiment = [];
    for (var i = 0; i < characters.length; i++) {
        sentiment[i] = [];
        var data = nested_acts[season - 1].values;
        for (var j = 0; j < data.length; j++) {
            sentiment[i][j] = {};
            var d = data[j];
            sentiment[i][j].sentiment = d3.sum(d.values, function (d) {
                if (d.actualCharacters.length > 0)
                    return parseInt(d3.sum(d.sentiments, function (d) {
                        return d.name == characters[i] ? d.value : 0;
                    }));
                else return 0;
            }) / d3.sum(d.values, function (d) {
                if (d.actualCharacters.length > 0)
                    return parseInt(d3.sum(d.actualCharacters, function (d) {
                        return d.name == characters[i] ? d.value : 0;
                    }));
                else return 0;
            });
            sentiment[i][j].index = parseInt(d.key);

        }
    }
    sentiment_trend.selectAll("g.series").remove();
    sentiment_trend.selectAll("g.series").data(sentiment).enter().append("g").attr("class", "series")
        .append("path")
        .attr("class", "line")
        .style("stroke", function (d, i) {
            return charactersColor[i];
        })
        .attr("d", function (d) {
            return line(d);
        });

}
selectSeason(1);