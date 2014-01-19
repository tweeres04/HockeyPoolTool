function showErrorMessage(type, message){
    var alert = $("<div>").addClass("alert alert-" + type);
    alert.append('<button type="button" class="close" data-dismiss="alert">&times;</button>');
    alert.append($("<p>").html(message));
    $(".container").prepend(alert);
}

var HockeyPoolToolViewModel = function () {
    var me = this;

    me.views = [ { name: "my-team", viewModel: MyTeamViewModel, label: "My Team" }, { name: "stats", viewModel: StatsViewModel, label: "Stats" } ];
    me.currentView = ko.observable(me.views[0]);

    me.allPlayers = ko.observableArray();
    me.allTeams = ko.observableArray();
    me.myTeam = ko.observableArray();
    me.currentViewModel = ko.observable();

    me.currentView.subscribe(function(newView){
        me.currentViewModel = new newView.viewModel({ parent: me });
    });

    $.ajaxSetup({ contentType: "application/json" });

    $(document).ajaxError(function(event, request, settings) {
        showErrorMessage("danger", 'Error requesting <span class="alert-link">' + settings.url + "</span>");
    });

    loadData(function(){
        me.currentViewModel(new MyTeamViewModel({ parent: me }));
    });

    function loadData(callback) {
        $.getJSON("/teams", function (teams) {
            me.allTeams(teams);
            $.getJSON("/players", function (players) {
                me.allPlayers(players);
                $.getJSON("/myteam", function (team) {
                    me.myTeam(team);

                    me.myTeam.subscribe(function (newValue) {
                        $.post("/myteam", ko.toJSON(me.myTeam), function (response) {
                            console.log(response);
                        });
                    });

                    for (var i in me.myTeam()) {
                        for(var j in me.allPlayers()){
                            if(me.myTeam()[i].Name == me.allPlayers()[j].Name){
                                me.allPlayers.remove(me.allPlayers()[j]);
                                break;
                            }
                        }
                    }
                    callback();
                });
            });
        });
    };
};

function StatsViewModel(options){
    var me = this;
    me.parent = options.parent;

    me.headers = Object.keys(me.parent.allPlayers()[0]);
}

function MyTeamViewModel(options){
    var me = this;
    me.parent = options.parent;

    me.selectedTeam = ko.observable();
    me.selectedTeam.subscribe(function (newValue) {
        resizeMyTeamPanel();
    });
    me.selectedTeam(me.parent.allTeams()[0]);
    //me.selectedPlayer = ko.observable("");

    function resizeMyTeamPanel() {
        $(".my-team").height($(".players-list").height());
    };

    function setUpDragAndDrop() {
        $(".player, .my-team-player").draggable({ revert: true, zIndex: 10 });

        $(".my-team").droppable({
            accept: ".player",
            tolerance: "pointer",
            drop: function (event, ui) {
                var player = ko.dataFor(ui.draggable[0]);
                me.parent.allPlayers.remove(player);
                me.myTeam.push(player);
                $(".my-team-player").draggable({ revert: true });
            }
        });

        $("body").droppable({
            accept: ".my-team-player",
            tolerance: "pointer",
            drop: function (event, ui) {
                var player = ko.dataFor(ui.draggable[0]);
                me.parent.allPlayers.push(player);
                me.myTeam.remove(player);
                $(".player").draggable({ revert: true });
            }
        });

        $(".my-team").on("drop", function (event, ui) {
            event.stopPropagation();
        });
    }
}

ko.applyBindings(new HockeyPoolToolViewModel());