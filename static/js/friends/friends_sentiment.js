var characters = ["Monica", "Ross", "Rachel", "Joey", "Chandler", "Phoebe"];
var charactersColor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
var seasonsAvailable = 8;

function getCharacterId(name) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i] == name)
            return i;
    }
    return null;
}

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

//Storyline prepare
var storyline = d3.select("#storyline");




















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
        .append("span").attr("class", "badge").style("background-color",function (d) {
            return getSentimentColor(d.sentiment);
        }).text(function (d) {
            return getSentimentText(d.sentiment);
        });
    showscript(episode.values[0]);

}

function showscript(act) {
    console.log(act);
    console.log(act.scene);
    d3.json("/data/friends/" + act.season + "/" + act.episode + "/" + act.act + "", function (data) {
        d3.select("#scriptdisplay").selectAll("div").remove();
        var scriptdisplay = d3.select("#scriptdisplay").append("div");
        scriptdisplay.append("h3").text("Season " + act.season + " Episode " + act.episode + " Act " + act.act);
        if (act.scene != null)
            scriptdisplay.append("h2").text("Scene description: " + act.scene);
        var dialogues = scriptdisplay.selectAll("p").data(data).enter()
            .append("p");
        dialogues.append("span").attr("class",function (d) {
            return d.speaker;
        }).text(function (d) {
                return d.speaker + ":";
            })
        dialogues.append("span").text(function (d) {
            return d.content;
        })
    });
}

function updateSentimentLine(season) {
}
selectSeason(1);