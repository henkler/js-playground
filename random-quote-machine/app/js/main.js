/*global $:true*/

$(document).ready(function() {
    'use strict';
    var quotes = [{
        "quote": "Whatever the mind of man can conceive and believe, it can achieve.",
        "author": "Napoleon Hill"
    }, {
        "quote": "Strive not to be a success, but rather to be of value.",
        "author": "Albert Einstein"
    }, {
        "quote": "I attribute my success to this: I never gave or took any excuse",
        "author": "Florence Nightingale"
    }, {
        "quote": "Every strike brings me closer to the next home run.",
        "author": "Babe Ruth"
    }, {
        "quote": "Definiteness of purpose is the starting point of all achievement.",
        "author": "W. Clement Stone"
    }, {
        "quote": "Eighty percent of success is showing up.",
        "author": "Woody Allen"
    }, {
        "quote": "Either you run the day, or the day runs you. ",
        "author": "Jim Rohn"
    }, {
        "quote": "Whether you think you can or you think you can’t, you’re right.",
        "author": "Henry Ford"
    }, {
        "quote": "People often say that motivation doesn’t last. Well, neither does bathing.  That’s why we recommend it daily.",
        "author": "Zig Ziglar"
    }, {
        "quote": "Every child is an artist.  The problem is how to remain an artist once he grows up.",
        "author": "Pablo Picasso"
    }];

    function newQuote() {
        var random = Math.floor(Math.random() * quotes.length);
        var quote = quotes[random].quote;
        var author = quotes[random].author;

        $('#quote').text(quote);
        $('#author').text(author);
        $('#tweet_quote').attr('data-text', quote + ' -' + author);
    }

    newQuote();

    $("#new_quote").on("click", function(event) {
        event.preventDefault();
        newQuote();
    });
});