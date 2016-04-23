/*global $:true*/
'use strict'
var usernames = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff", "brunofin", "comster404"];

function getStream(username) {
    $.getJSON('https://api.twitch.tv/kraken/streams/' + username + '?callback=?', function(data) {
        if (!data.error) {
            $.getJSON(data._links.channel + '?callback=?', function(channel) {
                generateStreamerDisplay(username, data.stream, channel);
            });
        } else {
            generateStreamerDisplay(username, null, null);
        }
    });
}

function generateStreamerDisplay(username, stream, channel) {
    var $row = $('<div class="row twitch-account"></div>');
    var userProfileImage = "<div class='col-xs-3'>";
    if (channel && channel.logo) {
        userProfileImage += "<img class='img-responsive img-circle' src=" + channel.logo + ">";
    } else {
        userProfileImage += "<img class='img-responsive' src=https://pbs.twimg.com/profile_images/2349866958/m9pjwl1x1n3nvzf8x8rc.png>";
    }
    userProfileImage += "</div>";

    var userProfileName = "<div class='col-xs-3'><a href='http://www.twitch.tv/" + username + "' target='_blank'>" + username + "</p></div>";

    var userStatus = "<div class='col-xs-6'><p>";
    if (channel && channel.status) {
        userStatus += channel.status;
        $row.addClass("online");
    } else if (!channel) {
        userStatus += "Account not available";
        $row.addClass("closed");
    } else {
        $row.addClass("offline");
        userStatus += "Offline";
    }
    userStatus += "</p></div>";

    $row.append(userProfileImage);
    $row.append(userProfileName);
    $row.append(userStatus);
    $("#streamer-table").append($row);
}

function filterDisplay(status) {
    if (status == "all") {
        $(".twitch-account").show();
    } else if (status == "online") {
        $(".twitch-account").hide();
        $(".online").show();
    } else if (status == "offline") {
        $(".twitch-account").hide();
        $(".offline").show();
    } else if (status == "closed") {
        $(".twitch-account").hide();
        $(".closed").show();
    }
}

$(document).ready(function() {
    usernames.forEach(function(username) {
        getStream(username);
    });

    $("#online-button").on("click", function() {
        filterDisplay("online");
    });

    $("#offline-button").on("click", function() {
        filterDisplay("offline");
    });

    $("#closed-button").on("click", function() {
        filterDisplay("closed");
    });

    $("#all-button").on("click", function() {
        filterDisplay("all");
    });
});