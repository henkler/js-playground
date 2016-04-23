/*global $:true*/
'use strict';

function createStory(story) {
  var $storyDiv = $("<div class='grid-item'></div>");
  var $articleLink = $("<a></a>");
  $articleLink.attr("href", story.link);
  $articleLink.attr("target", "_blank");
  var $headline = $("<h2>" + story.headline + "</h2>");
  var $image = $("<img class='img-responsive'>");
  var userProfileLink = "<div class='author-profile'><a href=http://www.freecodecamp.com/" + story.author.username + " target='_blank'>- " + story.author.username + "</a></div>";
  var upVotes = "<div class='text-center'><i class='fa fa-heart-o'></i> " + story.rank + "</div>";

  if (story.image && story.image != "undefined") {
    $image.attr("src", story.image);
    $storyDiv.addClass("grid-item--width-2");
  } else if (story.author.picture) {
    $image.attr("src", story.author.picture);
  }

  $articleLink.append($image);
  $articleLink.append(upVotes);
  $articleLink.append($headline);
  $articleLink.append(userProfileLink);

  $storyDiv.append($articleLink);

  return $storyDiv;
}

$(document).ready(function() {
  var $grid = $(".grid");

  var apiURL = "http://www.freecodecamp.com/news/hot";

  $.getJSON(apiURL, function(json) {
    $.each(json, function(key, story) {
      $grid.append(createStory(story));
    });

    // format the grid using Masonry and the ImagesLoaded plugin.  Format grid after all images loaded
    $grid.imagesLoaded(function() {
      $($grid).masonry({
        itemSelector: '.grid-item',
        columnWidth: 240,
        gutter: 10
      });
    });
  });
});