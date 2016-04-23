/*global $:true*/
'use strict'

function createArticle(article) {
  var $containerDiv = $("<div class='grid-item col-xs-3'></div>");
  var $articleDiv = $("<div class='article'></div>");
  var $articleLink = $("<a></a>");
  $articleLink.attr("href", "https://en.wikipedia.org/?curid=" + article.pageid);
  $articleLink.attr("target", "_blank");

  var title = "<h2>" + article.title + "</h2>";

  $articleLink.append(title);

  if (article.thumbnail && article.thumbnail.source) {
    var image = "<img class='img-responsive' src=" + article.thumbnail.source + ">";
    $articleLink.append(image);
  }

  if (article.extract) {
    var extract = "<p>" + article.extract + "</p>";
    $articleLink.append(extract);
  }

  $articleDiv.append($articleLink);
  $containerDiv.append($articleDiv);

  return $containerDiv;
}

function searchWikipedia(searchTerm, articleOffset, articlesPerPage, addArticleCallback, refreshPageCallback) {
  // URL generated from the API Sandbox.  Page Images and Extracts returned.  Generator used = search
  // https://en.wikipedia.org/wiki/Special:ApiSandbox
  var apiURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&format=json&exsentences=1&exlimit=max&exintro=&explaintext=&exsectionformat=plain&piprop=thumbnail&pithumbsize=500&pilimit=max";

  // use the random generator if passed the hidden random search value
  if (searchTerm == "==random==") {
    apiURL += "&generator=random&grnnamespace=0&grnlimit=" + articlesPerPage + "&grnoffset=" + articleOffset + "&callback=?";
  } else {
    apiURL += "&generator=search&gsrnamespace=0&gsrlimit=" + articlesPerPage + "&gsroffset=" + articleOffset + "&gsrsearch=" + encodeURIComponent(searchTerm) + "&callback=?";
  }

  $.getJSON(apiURL, function(json) {
    $.each(json.query.pages, function(key, article) {
      addArticleCallback(createArticle(article));
    });

    refreshPageCallback();
  });
}

$(document).ready(function() {
  var searchTerm;
  var articleOffset;
  var articlesPerPage;

  var $grid = $(".grid");
  $grid.masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
  });

  function addArticleToDisplay(articleElement) {
    $grid.append(articleElement);
  }

  function clearGrid() {
    $grid.empty();
    $grid.append('<div class="grid-sizer col-xs-3"></div>');
  }

  function resetPage() {
    searchTerm = null;
    articleOffset = 0;
    articlesPerPage = 20;

    clearGrid();
    $("#more_button").hide();
  }

  function refreshPage() {
    if (searchTerm) {
      $("#more_button").show();
    }

    $grid.imagesLoaded(function() {
      $grid.masonry('reloadItems');
      $grid.masonry();
    });
  }

  function doSearch() {
    if (searchTerm) {
      clearGrid();
      searchWikipedia(searchTerm, articleOffset, articlesPerPage, addArticleToDisplay, refreshPage);
    }
  }

  $("#search_button").on("click", function() {
    searchTerm = $("#search").val();
    doSearch();
  });

  $("#random_button").on("click", function() {
    searchTerm = "==random==";
    $("#search").val("");
    doSearch();
  });

  $("#more_button").on("click", function() {
    articleOffset += articlesPerPage;
    doSearch();
  });

  // set up autocomplete on the search box
  $("#search").autocomplete({
    source: function(req, response) {
      $.ajax({
        url: "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + req.term,
        dataType: "jsonp",
        success: function(data) {
          response(data[1]);
        }
      });
    },
    select: function() {
      searchTerm = $("#search").val();
      doSearch();
    }
  });

  resetPage();
});