/*global $:true*/
function Simon(buttonLightUpCallback, updateDisplayCallback) {
  "use strict";
  // private constants
  var MAX_SEQUENCE_LENGTH = 20;
  var LIGHT_ON_TIME = 500;
  var DEFAULT_SEQUENCE_TIME_DELAY = 1000;
  var INPUT_WAIT_TIME = 4000;
  var BUTTON_SOUNDS = {
    1: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
    2: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
    3: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
    4: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"
  };

  // private properties
  var _on = false;
  var _started = false;
  var _locked = false;
  var _strict = false;
  var _sequence;
  var _currentCorrect;
  var _count;

  var _sequencePlaybackTimer;
  var _inputTimer;
  var _self = this;

  var _buttonLightUpCallback = buttonLightUpCallback;
  var _updateDisplayCallback = updateDisplayCallback;

  // private methods
  var _clearTimers = function() {
    clearInterval(_sequencePlaybackTimer);
    clearTimeout(_inputTimer);
    _sequencePlaybackTimer = null;
    _inputTimer = null;
  };
  var _displaySequence = function() {
    var currentSequence = 0;
    _clearTimers();
    _updateDisplay();
    _sequencePlaybackTimer = window.setInterval(function() {
      _lightUpButton(_sequence[currentSequence], Math.floor(_getSequenceLightDelay() / 2));
      if (currentSequence === _count - 1) {
        _clearTimers();
        _startInputTimer();
      } else {
        currentSequence++;
      }
    }, _getSequenceLightDelay());
  };
  var _generateSequence = function() {
    _sequence = [];
    for (var i = 0; i < MAX_SEQUENCE_LENGTH; i++) {
      _sequence.push(Math.floor(Math.random() * 4) + 1);
    }
    _count = 1;
  };
  var _getSequenceLightDelay = function() {
    if (_count >= 13) {
      return Math.floor(DEFAULT_SEQUENCE_TIME_DELAY * 0.33);
    } else if (_count >= 9) {
      return Math.floor(DEFAULT_SEQUENCE_TIME_DELAY * 0.66);
    } else if (_count >= 5) {
      return Math.floor(DEFAULT_SEQUENCE_TIME_DELAY * 0.75);
    } else {
      return DEFAULT_SEQUENCE_TIME_DELAY;
    }
  };
  var _isBusy = function() {
    return _sequencePlaybackTimer !== null || _locked;
  };
  var _lightUpButton = function(buttonID, lightUpTime) {
    if (!lightUpTime) {
      lightUpTime = LIGHT_ON_TIME;
    }
    _buttonLightUpCallback(buttonID);
    _playSound(buttonID);
    setTimeout(function() {
      _buttonLightUpCallback(null);
    }, lightUpTime);
  };
  var _playSound = function(buttonID) {
    if (buttonID && BUTTON_SOUNDS[buttonID]) {
      var audio = new Audio(BUTTON_SOUNDS[buttonID]);
      audio.play();
    }
  };
  var _reset = function() {
    _clearTimers();
    _currentCorrect = 0;
    _started = false;
    _locked = false;
    _generateSequence();
    _updateDisplay();
  };
  var _successfulAttempt = function() {
    _currentCorrect++;
    if (_currentCorrect == _count) {
      if (_count == MAX_SEQUENCE_LENGTH) {
        _winGame();
      } else {
        _count = _currentCorrect + 1;
        _currentCorrect = 0;
        _displaySequence();
      }
    }
  };
  var _failedAttempt = function() {
    _currentCorrect = 0;
    _lightUpButton("all");
    if (_strict) {
      _generateSequence();
    }
    _displaySequence();
  };
  var _startInputTimer = function() {
    if (_inputTimer !== null) {
      return;
    }
    _inputTimer = setTimeout(function() {
      _failedAttempt();
    }, INPUT_WAIT_TIME);
  };
  var _stopInputTimer = function() {
    if (_inputTimer) {
      clearTimeout(_inputTimer);
      _inputTimer = null;
    }
  };
  var _updateDisplay = function() {
    _updateDisplayCallback(_self);
  };
  var _winGame = function() {
    _clearTimers();
    _locked = true;
    _updateDisplay();

    var cycleCount = 0;
    var maxCycleCount = 40;

    _sequencePlaybackTimer = window.setInterval(function() {
      if (cycleCount >= maxCycleCount) {
        _locked = false;
        _self.start();
      } else {
        _lightUpButton((cycleCount % 4) + 1, 50);
        cycleCount++;
      }
    }, 100);
  };

  // priviledged methods
  this.powerToggle = function() {
    _on = !_on;
    _strict = false;
    _reset();
  };
  this.start = function() {
    if (_on) {
      _reset();
      _started = true;
      _updateDisplay();
      _displaySequence();
    }
  };
  this.strictToggle = function() {
    if (_on) {
      _strict = !_strict;
      _updateDisplay();
    }
  };
  this.pushButton = function(buttonID) {
    buttonID = parseInt(buttonID);
    if (!_on || !_started || _isBusy() || isNaN(buttonID)) {
      return;
    }
    _stopInputTimer();

    _lightUpButton(buttonID, LIGHT_ON_TIME);
    // lock button inputs until success or failure displayed
    _locked = true;
    setTimeout(function() {
      if (_sequence[_currentCorrect] == buttonID) {
        _successfulAttempt();
      } else {
        _failedAttempt();
      }
      _locked = false;
    }, LIGHT_ON_TIME);
  };
  this.getDisplay = function() {
    if (!_on) {
      return "&nbsp";
    }
    if (!_started) {
      return "--";
    }

    if (_currentCorrect == _count) {
      return "**";
    } else if (_count < 10) {
      return "0" + _count;
    } else {
      return _count;
    }
  };
  this.getOn = function() {
    return _on;
  };
  this.getStrict = function() {
    return _strict;
  };

  _reset();
  _updateDisplay();
}

$(document).ready(function() {
  function buttonLightUpCallback(buttonID) {
    $(".simon-button").removeClass("lit-up");
    if (buttonID) {
      if (buttonID == "all") {
        $(".simon-button").addClass("lit-up");
      } else {
        $(".simon-button[data-button-id='" + buttonID + "']").addClass("lit-up");
      }
    }
  }

  function updateDisplayCallback(game) {
    if (game.getOn()) {
      $("#btnOn").text("Off");
      $("#btnOn").removeClass("btn-success");
      $("#btnOn").addClass("btn-danger");
    }
    else {
      $("#btnOn").text("On");
      $("#btnOn").removeClass("btn-danger");
      $("#btnOn").addClass("btn-success");
    }

    if (game.getStrict()) {
       $("#btnStrict").text("Strict Off");
    }
    else {
      $("#btnStrict").text("Strict On");
    }
    $("#message").html(game.getDisplay());

    for (var i = 0; i < 1; i++) {
      $("#message").fadeIn(250).fadeOut(250).fadeIn(250);
    }
  }
  var simon = new Simon(buttonLightUpCallback, updateDisplayCallback);

  $(".simon-button").on("click", function() {
    var buttonID = $(this).attr("data-button-id");
    simon.pushButton(buttonID);
  });

  $("#btnOn").on("click", function() {
    simon.powerToggle();
  });
  $("#btnStart").on("click", function() {
    simon.start();
  });
  $("#btnStrict").on("click", function() {
    simon.strictToggle();
  });
});