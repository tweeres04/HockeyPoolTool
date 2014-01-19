var ViewModel = function () {
    var me = this;

    me.views = [ { name: "my-team", viewModel: MyTeamViewModel, label: "My Team" }, { name: "stats", viewModel: StatsViewModel, label: "Stats" } ];
    me.currentView = ko.observable(me.views[0]);

    me.allPlayers = ko.observableArray();

    me.allTeams = ko.observableArray();

    me.currentViewModel = new MyTeamViewModel({ parent: me });

    me.currentView.subscribe(function(newView){
        me.currentViewModel = new newView.viewModel({ parent: me });
    });
};

function StatsViewModel(options){
    var me = this;
    me.parent = options.parent;
}

function MyTeamViewModel(options){
    var me = this;
    me.parent = options.parent;

    me.resizeMyTeamPanel = function () {
        $(".my-team").height($(".players-list").height());
    };

    me.selectedTeam = ko.observable({ code: "Hi", name: "Please select a team" });
    me.selectedTeam.subscribe(function (newValue) {
        me.resizeMyTeamPanel();
    });
    me.selectedPlayer = ko.observable("");

    me.myTeam = ko.observableArray();

    me.loadData = function (callback) {
        $.getJSON("/teams", function (teams) {
            me.parent.allTeams(teams);
            me.selectedTeam(me.parent.allTeams()[0]);
            $.getJSON("/players", function (players) {
                me.parent.allPlayers(players);
                $.getJSON("/myteam", function (team) {
                    me.myTeam(team);

                    me.myTeam.subscribe(function (newValue) {
                        $.post("/myteam", ko.toJSON(me.myTeam), function (response) {
                            console.log(response);
                        });
                    });

                    for (var i in me.myTeam()) {
                        for(var j in me.parent.allPlayers()){
                            if(me.myTeam()[i].Name == me.parent.allPlayers()[j].Name){
                                me.parent.allPlayers.remove(me.parent.allPlayers()[j]);
                                break;
                            }
                        }
                    }
                    callback();
                });
            });
        });
    };

    me.init = function () {
        $.ajaxSetup({ contentType: "application/json" });

        me.loadData(afterLoadData);
        
        function afterLoadData() {
            me.resizeMyTeamPanel();
            setUpDragAndDrop();
        }

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
    };

    me.init();
}

ko.applyBindings(new ViewModel());