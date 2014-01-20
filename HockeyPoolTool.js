(function(){

function showMessage(type, message){
    var alert = $("<div>").addClass("alert alert-" + type);
    alert.append('<button type="button" class="close" data-dismiss="alert">&times;</button>');
    alert.append($("<p>").html(message));
    $(".container").prepend(alert);
}

function HockeyPoolToolViewModel(options) {
    var me = this;
    options = options || {};

    me.views = [ { name: "my-team", viewModel: MyTeamViewModel, label: "My Team" }, { name: "stats", viewModel: StatsViewModel, label: "Stats" } ];
    me.currentView = ko.observable(me.views[0]);

    me.allPlayers = ko.observableArray();
    me.allTeams = ko.observableArray();
    me.myTeam = ko.observableArray();
    me.stats = ko.observableArray();
    me.currentViewModel = ko.observable();

    me.currentView.subscribe(function(newView){
        me.currentViewModel(newView.viewModel);
    });

    $.ajaxSetup({ contentType: "application/json" });

    $(document).ajaxError(function(event, request, settings) {
        showMessage("danger", 'Error requesting <span class="alert-link">' + settings.url + "</span>");
    });

    loadData(function(){
        for(var i = 0; i < me.views.length; i++){
            me.views[i].viewModel = new me.views[i].viewModel({ parent: me });
        }
        me.currentViewModel(me.views[0].viewModel);
        if(options.callback){
            options.callback();
        }
    });

    me.afterRender = function(){
        if(me.currentViewModel().afterRender){
            me.currentViewModel().afterRender();
        }
    };

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
                    
                    if(callback){
                        callback();
                    }
                });
            });
        });
    };
};

function StatsViewModel(options){
    var me = this;
    me.parent = options.parent;
    options = options || {};

    me.headers = Object.keys(me.parent.allPlayers()[0]);
}

function MyTeamViewModel(options){
    var me = this;
    me.parent = options.parent;
    options = options || {};

    me.playersByTeam = {};
    me.selectedTeam = ko.observable();
    me.selectedTeam.subscribe(function (newValue) {
        resizeMyTeamPanel();
    });
    me.selectedTeam(me.parent.allTeams()[0]);

    me.afterRender = function(elements, data){
        resizeMyTeamPanel();
        setUpDroppables();
    };

    me.setUpDraggable = function(elements, data){
        $(elements).filter(".player, .my-team-player").draggable({ revert: true, zIndex: 10 });
    }

    getPlayersByTeam();

    function getPlayersByTeam(){
        me.parent.allPlayers().forEach(function(element, i, array){
            if(!me.playersByTeam.hasOwnProperty(element.Team)){
                me.playersByTeam[element.Team] = ko.observableArray();
            }
            me.playersByTeam[element.Team].push(element);
        });
    }

    function resizeMyTeamPanel() {
        $(".my-team").height($(".players-list").height());
    };

    function setUpDroppables(){
        $(".my-team").droppable({
            accept: ".player, .my-team-player",
            tolerance: "pointer",
            greedy: true,
            drop: function (event, ui) {
                if(!$(ui.draggable).hasClass("my-team-player")){
                    var player = ko.dataFor(ui.draggable[0]);
                    me.playersByTeam[me.selectedTeam().code].remove(player);
                    me.parent.myTeam.push(player);
                }
            }
        });

        $("body").droppable({
            accept: ".my-team-player",
            tolerance: "pointer",
            drop: function (event, ui) {
                var player = ko.dataFor(ui.draggable[0]);
                me.playersByTeam[player.Team].push(player);
                me.playersByTeam[player.Team].sort(function(a, b){
                    return a.Player < b.Player ? -1 : 1;
                })
                me.parent.myTeam.remove(player);
            }
        });
    }
}

var viewModel = new HockeyPoolToolViewModel();
ko.applyBindings(viewModel);

// function onHashChange(){
//     var hashParts = location.hash.split("/");

//     for(var i = 0; i < viewModel.views.length; i++){
//         if(viewModel.views[i].name == hashParts[1]){
//             viewModel.currentView(viewModel.views[i]);
//         }
//     }
// }

})();