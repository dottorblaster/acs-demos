function monitorStatusSocket() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/engine');

    socket.on('game_status', function(msg) {
	status = $.parseJSON(msg)

    $('#log').prepend('<br/>' + $('<div/>').text(new Date() + " : " + JSON.stringify(status)).html());
    $("#state").text(status.state);

	$("#number-of-players").text(status.minNumberOfPlayers);

	$("#abort").off("click");
	$("#abort").click( function (event) {
	    socket.emit('abort', status.gameUUID);
	});

	var tickets = [];
	$.each(status.tickets, function(index, ticket) {
	    tickets.push('<li>' + ticket.playerName + '</li>')
	});
	$("#tickets-list").empty();
	$("#tickets-list").append(tickets.join(''));

    if (status.state == "Playing") {
        $("#player-table-title").text("This Game");
        var players = [];
            $.each(status.playerResults, function(index, player) {
                players.push('<tr><td>' + player.name + '</td><td>' + player.points + '</td></tr>')
        });
        $("#player-table-body").empty();
        $("#player-table-body").append(players.join(''));
    } else {
        $("#player-table-title").text("That Game");
    }
    
    });

    var ping_pong_times = [];
    var start_time;
    window.setInterval(function() {
      start_time = (new Date).getTime();
      socket.emit('engine_ping');
    }, 1000);

    socket.on('engine_pong', function() {
      var latency = (new Date).getTime() - start_time;
      ping_pong_times.push(latency);
      ping_pong_times = ping_pong_times.slice(-30);
      var sum = 0;
      for (var i = 0; i < ping_pong_times.length; i++)
        sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
      });
}
