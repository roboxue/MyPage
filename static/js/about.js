        $(function () {
            $.getJSON("/static/works.json", function (meta_data) {
                add_experiences("northwestern", meta_data);
                add_experiences("fudan", meta_data);
                $("#northwestern-work-count").text(meta_data.northwestern.length + " projects");
                $("#fudan-work-count").text(meta_data.fudan.length + " projects");

                $(".roboxue-label").click(function () {
                    var $label = $(this).clone().append("<span class='glyphicon glyphicon-remove'></span>");
                    $label.click(function () {
                        $(".roboxue-experience").show("blind");
                        $(".roboxue-education").show("blind");
                        $("#filter .roboxue-label").remove();
                        $("#filter").hide();
                        $("#northwestern-work-count").text($("#northwestern .roboxue-experience:visible").length + " projects");
                        $("#fudan-work-count").text($("#fudan .roboxue-experience:visible").length + " projects");
                    });
                    if ($("#filter").find(".roboxue-label").length > 0) {
                        $("#filter .roboxue-label").remove();
                    }
                    $("#filter").append($label);
                    $("#filter").show("highlight");
                    var search = $(this).text();
                    $(".roboxue-experience").hide();
                    $(".roboxue-experience").filter(function () {
                        return $(this).find(".roboxue-label").filter(function () {
                            return $(this).text().indexOf(search) != -1;
                        }).length != 0;
                    }).show();
                    $("#northwestern-work-count").text($("#northwestern .roboxue-experience:visible").length + " of " + $("#northwestern .roboxue-experience").length + " projects");
                    $("#fudan-work-count").text($("#fudan .roboxue-experience:visible").length + " of " + $("#fudan .roboxue-experience").length + " projects");
                    $(".roboxue-education").hide();
                    $(".roboxue-education").filter(function () {
                        return $(this).find(".roboxue-label").filter(function () {
                            return $(this).text().indexOf(search) != -1;
                        }).length != 0;
                    }).show("highlight");
                });
            });

            $("#li_about").addClass("active");

            $(".roboxue-education-down").click(function () {
                $(this).parents(".col-md-9").children(".list-group").toggle("blind", 1000);
                $(this).toggleClass("glyphicon-collapse-down glyphicon-collapse-up");
            });

            $("#toggle-filter").click(function () {
                $(this).toggleClass("glyphicon-collapse-down glyphicon-collapse-up");
                $(this).parents("#filter-candidates").children("ul").toggle("blind", 500);
            });

            $(".roboxue-education-down").click();


        });


        function add_experiences(school, meta_data) {
            var exp_root = d3.select("#" + school).selectAll("div").data(meta_data[school]).enter()
                    .append("div").attr("class", "list-group-item roboxue-experience");
            var items = exp_root.append("h4").attr("class", "list-group-item-heading text-primary").text(function (d) {
                return d.title;
            })
                    .append("span").attr("class", "pull-right");
            items.filter(function (d) {
                return d.url != "";
            })
                    .append("a").attr("href",function (d) {
                        return d.url;
                    }).attr("target", "_blank").text(function (d) {
                        return d.company;
                    });
            items.filter(function (d) {
                return d.url == "";
            })
                    .append("span").text(function (d) {
                        return d.company;
                    });
            exp_root.append("p").attr("class", "list-group-item-text").selectAll("p").data(function (d) {
                return d.description;
            }).enter().append("p").attr("class", function (d, i) {
                        return i == 0 ? "roboxue-experience-summary" : "roboxue-experience-detail";
                    })
                    .attr("style", function (d, i) {
                        return i == 0 ? "" : "display:none;";
                    })
                    .text(function (d) {
                        return d;
                    });
            $("#" + school + " .roboxue-experience-summary").append("<span class='text-primary glyphicon glyphicon-plus'></span><span class='text-primary'>Detail</span>");
            $("#" + school + " .roboxue-experience-summary").click(function () {
                $(this).siblings().toggle("blind");
            });
            exp_root.append("h5").attr("class", "roboxue-tags").selectAll("span").data(function (d) {
                return d.skills;
            }).enter()
                    .append("span").attr("class",function (d) {
                        return "label roboxue-label roboxue-label-" + d.type;
                    }).text(function (d) {
                        return d.name;
                    });
        }