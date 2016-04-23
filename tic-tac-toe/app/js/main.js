/*global $:true*/
'use strict';

function TicTacToePlayer(marker, isHuman, level) {
  this.isHuman = isHuman;
  this.marker = marker;
  this.game = null;
  this.opponent = null;

  // every player gets an AI, even humans (for hints)
  this.AI = new TicTacToeAI(this, level);
}

TicTacToePlayer.prototype = {
  constructor: TicTacToePlayer,
  setLevel: function(level) {
    if (level >= 0 && level <= 3) {
      this.AI.level = level;
    }
  },
  setHuman: function(isHuman) {
    this.isHuman = Boolean(isHuman);
    this.game.update();
  }
};

function TicTacToe(player1, player2, displayCallback) {
  this.player1 = player1;
  this.player1.game = this;
  this.player1.opponent = player2;
  this.player2 = player2;
  this.player2.game = this;
  this.player2.opponent = player1;
  this.displayCallback = displayCallback;
  this.entryLocked = false;
  this.timerID = null;

  this.board = new TicTacToeBoard(this);

  this.reset();
}

TicTacToe.prototype = {
  constructor: TicTacToe,

  reset: function() {
    this.board.reset();
    clearTimeout(this.timerID);
    this.entryLocked = false;
    this.currentPlayer = this.player1;
    this.update();
  },

  update: function() {
    if (!this.currentPlayer.isHuman) {
      this.doAITurn(this.currentPlayer);
    }
    this.updateDisplay();
  },

  doTurn: function(pos) {
    if (this.entryLocked || parseInt(pos) == NaN || this.board.status() != "playing") {
      return;
    }
    if (this.board.markPosition(parseInt(pos), this.currentPlayer.marker)) {
      if (this.board.status() == "playing") {
        this.board.turnNum++;
        this.switchPlayers();
      }
      this.updateDisplay();
    }
  },

  doAITurn: function(player) {
    if (this.entryLocked || this.board.status() != "playing") {
      return;
    }

    // lock entry and make it look like the AI is "thinking" - e.g. wait for 1 seconds
    this.entryLocked = true;
    var that = this;
    this.timerID = setTimeout(function() {
      var pos = player.AI.getBestPosition();
      that.entryLocked = false;
      that.timerID = null;
      that.doTurn(pos);
    }, 1000);
  },

  getHint: function() {
    return this.currentPlayer.AI.getBestPosition();
  },

  getStatus: function() {
    switch (this.board.status()) {
      case 'playing':
        return (this.currentPlayer == this.player1) ? 'Player 1 Turn' : 'Player 2 Turn';
      case 'win-player1':
        return 'Player 1 Wins!';
      case 'win-player2':
        return 'Player 2 Wins!';
      case 'draw':
        return 'It\'s a draw!';
      default:
        return null;
    }
  },

  switchPlayers: function() {
    if (this.currentPlayer == this.player1) {
      this.currentPlayer = this.player2;
    } else {
      this.currentPlayer = this.player1;
    }

    if (!this.currentPlayer.isHuman) {
      this.doAITurn(this.currentPlayer);
    }
  },

  updateDisplay: function() {
    this.displayCallback(this);
  }
};

function TicTacToeBoard(game) {
  this.game = game;
  this.board;
  this.turnNum;
  this.reset();
}

TicTacToeBoard.prototype = {
  constructor: TicTacToeBoard,

  reset: function() {
    this.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    this.turnNum = 1;
  },

  status: function() {
    if (this.hasWin(this.game.player1.marker)) {
      return "win-player1";
    } else if (this.hasWin(this.game.player2.marker)) {
      return "win-player2";
    } else if (this.boardFull()) {
      return "draw";
    } else {
      return "playing";
    }
  },

  checkPositionMarkedByPlayer: function(pos) {
    return pos === this;
  },

  boardFull: function() {
    for (var pos = 0; pos < 9; pos++) {
      if (this.getPosition(pos) == null) {
        return false;
      }
    }

    return true;
  },

  hasWin: function(marker) {
    if (this.hasWinRow(marker) || this.hasWinColumn(marker) || this.hasWinDiagonal(marker)) {
      return true;
    } else {
      return false;
    }
  },

  hasWinLine: function(line, marker) {
    if (line.filter(this.checkPositionMarkedByPlayer, marker).length == 3) {
      return true;
    } else {
      return false;
    }
  },

  hasWinRow: function(marker) {
    for (var i = 0; i < 3; i++) {
      var row = this.board[i];
      if (this.hasWinLine(row, marker)) {
        return true;
      }
    }

    return false;
  },

  hasWinColumn: function(marker) {
    for (var i = 0; i < 3; i++) {
      var column = [this.board[0][i], this.board[1][i], this.board[2][i]];
      if (this.hasWinLine(column, marker)) {
        return true;
      }
    }
    return false;
  },

  hasWinDiagonal: function(marker) {
    var diag1 = [this.board[0][0], this.board[1][1], this.board[2][2]];
    var diag2 = [this.board[0][2], this.board[1][1], this.board[2][0]];
    if (this.hasWinLine(diag1, marker) || this.hasWinLine(diag2, marker)) {
      return true;
    } else {
      return false;
    }
  },

  availablePositions: function() {
    var avail = [];
    for (var i = 0; i < 9; i++) {
      if (this.getPosition(i) == null) {
        avail.push(i);
      }
    }

    return avail;
  },

  getPosition: function(position) {
    if (position < 0 || position > 8) {
      return null;
    }
    var column = position % 3;
    var row = Math.floor(position / 3);

    return this.board[row][column];
  },

  markPosition: function(position, marker) {
    if (position < 0 || position > 8) {
      return false;
    }
    var column = position % 3;
    var row = Math.floor(position / 3);

    if (this.board[row][column] == null) {
      this.board[row][column] = marker;
      return true;
    } else {
      return false;
    }
  },

  unmarkPosition: function(position) {
    if (position < 0 || position > 8) {
      return false;
    }
    var column = position % 3;
    var row = Math.floor(position / 3);

    this.board[row][column] = null;
    return true;
  },
  toString: function() {
    var board = "";
    for (var row = 0; row < 3; row++) {
      board += "| "
      for (var column = 0; column < 3; column++) {
        var marker = this.board[row][column];
        if (marker) {
          board += marker.toString() + ' '
        } else {
          board += '_ '
        }
      }
      board += "|\n";
    }
    return board;
  }
};

// This class creates a TicTacToe AI of varying difficulty.  0 = easiest (completely random) 3 = master (can never beat)
// NOTE - we could have used MinMax to create a more efficient solution algorithm.  This algorithm plays like a human.
//   It analyzes each move using human strategies.  As a result, it is a bit more code, but was way more fun to program
function TicTacToeAI(player, level) {
  this.player = player;
  this.level = level;
}

TicTacToeAI.prototype = {
  constructor: TicTacToeAI,
  getBoard: function() {
    return this.player.game.board;
  },
  // picks a strategy based on the difficulty level.  3 = perfect strategy from Wikipedia
  // https://en.wikipedia.org/wiki/Tic-tac-toe
  getStrategy: function() {
    var masterStrategy = [this.playStrategyWin, this.playStrategyBlock, this.playStrategyFork, this.playStrategyDefense, this.playStrategyCenter, this.playStrategyOppositeCorner, this.playStrategyCorner, this.playStrategySide];
    var expertStrategy = [this.playStrategyWin, this.playStrategyBlock, this.playStrategyFork];
    var noviceStrategy = [this.playStrategyWin, this.playStrategyBlock];
    var randomStrategy = [];

    switch (this.level) {
      case 0:
        return randomStrategy;
      case 1:
        return noviceStrategy;
      case 2:
        return expertStrategy;
      case 3:
        return masterStrategy;
      default:
        return masterStrategy;
    }
  },
  getRandomPosition: function() {
    var freePositions = this.getBoard().availablePositions();
    return freePositions[Math.floor(Math.random() * freePositions.length)];
  },
  // gets the best guess for the next position based on the strategy being used
  getBestPosition: function() {
    var strategy = this.getStrategy();

    // play each strategy until a position is found that matches the given strategy
    for (var i = 0; i < strategy.length; i++) {
      var pos = strategy[i].call(this);
      if (pos != null) {
        return pos;
      }
    }

    // if no position is found with our available strategies, return a random position to confuse our enemy!
    // NOTE - we should never actually have to do this with a 3x3 grid and an expert level AI
    return this.getRandomPosition();
  },
  // each of the play<ACTION> functions returns a position that can be played to yield the desired result.
  // EXAMPLE: playWin() returns a position value if a winning position can be found.
  // playAction function is a helper function for playWin, playBlock, playFork, and playDefense
  playStrategyAction: function(action) {
    var avail = this.getBoard().availablePositions();
    var pos = null;

    for (var i = 0; i < avail.length; i++) {
      pos = this.testLines(avail[i], action);
      if (pos != null) {
        break;
      }
    }
    return pos;
  },
  playStrategyWin: function() {
    return this.playStrategyAction("win");
  },
  playStrategyBlock: function() {
    return this.playStrategyAction("block");
  },
  playStrategyFork: function() {
    return this.playStrategyAction("fork");
  },
  playStrategyDefense: function() {
    return this.playStrategyAction("defense");
  },
  playStrategyCenter: function() {
    return this.getBoard().getPosition(4) ? null : 4;
  },
  playStrategyOppositeCorner: function() {
    var corners = [0, 2, 6, 8];
    var oppositeCorners = [8, 6, 2, 0];
    for (var i = 0; i < corners.length; i++) {
      var corner = this.getBoard().getPosition(corners[i]);
      var oppositeCorner = this.getBoard().getPosition(oppositeCorners[i]);
      if (corner == this.player.opponent.marker && oppositeCorner == null) {
        return oppositeCorners[i];
      }
    }
  },
  playStrategyCorner: function() {
    var corners = [0, 2, 6, 8];
    for (var i = 0; i < corners.length; i++) {
      var corner = this.getBoard().getPosition(corners[i]);
      if (corner == null) {
        return corners[i];
      }
    }

    return null;
  },
  playStrategySide: function() {
    var sides = [1, 3, 5, 7];
    for (var i = 0; i < sides.length; i++) {
      var side = this.getBoard().getPosition(sides[i]);
      if (side == null) {
        return sides[i];
      }
    }

    return null;
  },
  // test all lines going through position for <operation> where operation is: win, block, fork, defense
  testLines: function(position, operation) {
    if (this.getBoard().getPosition(position) != null) {
      return null;
    }

    var opportunityCount = 0;
    var opponentOpportunityCount = 0;

    // get all the lines going through the position
    var lines = this.generateLines(position);

    // look at each line going through position in turn
    for (var i = 0; i < lines.length; i++) {
      var myCount = 0;
      var opponentCount = 0;
      var line = lines[i];

      for (var j = 0; j < 3; j++) {
        var pos = this.getBoard().getPosition(line[j]);
        switch (pos) {
          case this.player.marker:
            myCount++;
            break;
          case this.player.opponent.marker:
            opponentCount++;
            break;
        }
      }

      // I have one in the line and no blocking, this is an opportunity
      if (myCount == 1 && opponentCount == 0) {
        opportunityCount++;
        // if we are in the defense strategy, see if placing a marker here creates a fork opportunity for the opponent.  If so, we don't want this spot.
        if (operation == "defense") {
          for (var k = 0; k < 3; k++) {
            var opponentPos = line[k];
            // only look at spots that are empty in the same row as the one we are looking to take
            if (opponentPos != position && this.getBoard().getPosition(opponentPos) == null) {
              // if the empty spot is not a fork for the opponent, this is a good defense
              if (this.testLines(opponentPos, "opponentfork") != opponentPos) {
                return position;
              }
            }
          }
        }
      }

      // Opponent has one in the line and no blocking, opponent has opportunity
      if (opponentCount == 1 && myCount == 0) {
        opponentOpportunityCount++;
      }

      // I win if placed in this spot
      if (operation == "win" && myCount == 2 && opponentCount == 0) {
        return position;
      }

      // opponent wins if placed in this spot
      if (operation == "block" && opponentCount == 2 && myCount == 0) {
        return position;
      }
    }

    // If this spot has 2 or more opportunities, it is a fork
    if (operation == "fork" && opportunityCount > 1) {
      return position;
    }

    // If this spot has 2 or more opponent opportunities, it is a fork for opponent
    if (operation == "opponentfork" && opponentOpportunityCount > 1) {
      return position;
    }

    // If this spot has 2 or more opportunities for opponent, we want to play defense
    if (operation == "defense" && opponentOpportunityCount > 1) {
      return position;
    }

    return null;
  },
  // generate all the lines going through a given board position.  Each line is an array of 3 board positions, e.g. [0,1,2]
  generateLines: function(position) {
    var lines = [];
    var rowNum = Math.floor(position / 3);
    var columnNum = position % 3;
    // add the row going through the position
    lines.push([(rowNum * 3), (rowNum * 3) + 1, (rowNum * 3) + 2]);

    // add the column going through the position
    lines.push([columnNum, columnNum + 3, columnNum + 6]);

    // add the diagonals (if go through position)
    if (position == 0 || position == 4 || position == 8) {
      lines.push([0, 4, 8]);
    }
    if (position == 2 || position == 4 || position == 6) {
      lines.push([2, 4, 6]);
    }

    return lines;
  }
}

$(document).ready(function() {
  var player1 = new TicTacToePlayer("X", true);
  var player2 = new TicTacToePlayer("O", true);
  var ttt = new TicTacToe(player1, player2, redrawDisplayBoard);
  updateOptions();

  $("#reset-button").on("click", function() {
    ttt.reset();
  });

  $(".square").on("click", function() {
    var pos = $(this).attr("data-position");
    ttt.doTurn(pos);
  });

  $("input").on("change", function() {
    updateOptions();
  });

  function updateOptions() {
    var player1Human = $("#player1Human").is(':checked');
    var player2Human = $("#player2Human").is(':checked');
    player1.setHuman(player1Human);
    player2.setHuman(player2Human);

    var player1Level = parseInt($("input[name=player1Level]:checked").val());
    var player2Level = parseInt($("input[name=player2Level]:checked").val());
    player1.setLevel(player1Level);
    player2.setLevel(player2Level);

    if (player1Human) {
      $("#player1Level").hide();
    } else {
      $("#player1Level").show();
    }
    if (player2Human) {
      $("#player2Level").hide();
    } else {
      $("#player2Level").show();
    }
  }

  function redrawDisplayBoard(ttt) {
    var board = ttt.board;
    for (var pos = 0; pos < 9; pos++) {
      var t = board.getPosition(pos);
      var $marked = $('#pos_' + pos);
      if (t && t == player1.marker) {
        $marked.addClass('player1');
      } else if (t && t == player2.marker) {
        $marked.addClass('player2');
      } else {
        $marked.removeClass('player1');
        $marked.removeClass('player2');
      }
    }

    $("#status").text(ttt.getStatus());
  }
});