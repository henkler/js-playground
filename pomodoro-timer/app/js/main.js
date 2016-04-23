/*global $:true*/
'use strict';

function PomodoroTimer(pomodoroLength, breakLength, updateDisplayCallback) {
  this.pomodoroLength = pomodoroLength;
  this.breakLength = breakLength;
  this.updateDisplayCallback = updateDisplayCallback;
  this.pomodorosCompleted = 0;

  this.timerSecondsLeft;
  this.timerMode = "Work";
  this.intervalID;

  this.reset();
}

PomodoroTimer.prototype = {
  constructor: PomodoroTimer,

  timeLeft: function() {
    return this.secondsToPrettyMinutes(this.timerSecondsLeft);
  },

  work: function() {
    return this.timerMode == "Work";
  },

  break: function() {
    return this.timerMode == "Break";
  },

  reset: function() {
    this.stop();
    this.timerSecondsLeft = this.pomodoroLength * 60;
    this.timerMode = "Work";
    this.updateDisplay();
  },

  start: function() {
    var self = this;
    // update the timer every second
    if (!this.active()) {
      // need the anonymous function for the callback parameter so we can pass the current timer object
      this.intervalID = window.setInterval(function() {
        self.timerCallback();
      }, 1000);
    }
  },

  stop: function() {
    if (this.active()) {
      window.clearInterval(this.intervalID);
      this.intervalID = null;
    }
  },

  active: function() {
    return this.intervalID != null;
  },

  toggle: function() {
    if (this.active()) {
      this.stop();
    } else {
      this.start();
    }
  },

  updatePomodoroTime: function(increment) {
    // live update the timer if it is running and in work mode
    if (this.work() && (increment * 60 + this.timerSecondsLeft > 0)) {
      this.pomodoroLength += increment;
      this.timerSecondsLeft += (increment * 60);
    } else if (increment + this.pomodoroLength > 0) {
      this.pomodoroLength += increment;
    }

    this.updateDisplay();
  },

  updateBreakTime: function(increment) {
    // live update the timer if it is running and in work mode
    if (this.break() && (increment * 60 + this.timerSecondsLeft > 0)) {
      this.breakLength += increment;
      this.timerSecondsLeft += (increment * 60);
    } else if (increment + this.breakLength > 0) {
      this.breakLength += increment;
    }

    this.updateDisplay();
  },

  percentComplete: function() {
    var totalSeconds;
    if (this.work()) {
      totalSeconds = this.pomodoroLength * 60;
    } else {
      totalSeconds = this.breakLength * 60;
    }

    return 100 * ((totalSeconds - this.timerSecondsLeft) / totalSeconds);
  },

  updateDisplay: function() {
    this.updateDisplayCallback(this);
  },

  // callback called every second.  Stops timer and plays sound when timer hits 0
  timerCallback: function() {
    var bell;
    // stop the timer once it hits 0
    if (this.timerSecondsLeft <= 0) {
      // reset the timer for the break time
      if (this.work()) {
        this.timerSecondsLeft = this.breakLength * 60;
        this.timerMode = "Break";
        bell = new Audio('http://www.soundjay.com/misc/small-bell-ringing-02.mp3');

      } else {
        this.pomodorosCompleted++;
        this.timerMode = "Work";
        this.timerSecondsLeft = this.pomodoroLength * 60;
        bell = new Audio('http://www.soundjay.com/misc/bell-ringing-05.mp3');
      }
      bell.play();
    }

    this.updateDisplay();
    this.timerSecondsLeft--;
  },

  // helper to convert seconds to M:SS format
  secondsToPrettyMinutes: function(sec) {
    var seconds = sec % 60;
    var secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
    var minutes = Math.floor(sec / 60);

    return minutes + ':' + secondsStr;
  }
};

$(document).ready(function() {
  var timer = new PomodoroTimer(25, 5, updateDisplayCallback);

  // updates the timer value on the page
  function updateDisplayCallback(this_timer) {
    $('#time_left').text(this_timer.timeLeft());
    $('#timer_mode').text(this_timer.timerMode);
    $('#pomodoro_length').text(this_timer.pomodoroLength + ' min');
    $('#break_length').text(this_timer.breakLength + ' min');
    $('#pomodoros_completed').text(this_timer.pomodorosCompleted + ' pomodoros completed');

    var $progress_slider = $('#timer_progress');
    var $progress_span = $progress_slider.find('span');

    if (this_timer.work() && !$progress_slider.hasClass('progress-bar-info')) {
      $progress_slider.removeClass('progress-bar-success');
      $progress_slider.addClass('progress-bar-info');
    }

    if (this_timer.break() && !$progress_slider.hasClass('progress-bar-success')) {
      $progress_slider.removeClass('progress-bar-info');
      $progress_slider.addClass('progress-bar-success');
    }

    $progress_slider.attr('aria-valuenow', this_timer.percentComplete());
    $progress_slider.css('width', this_timer.percentComplete() + '%');
    $progress_span.text(this_timer.percentComplete() + '% Complete');

    var $panel = $('.panel');
    if (this_timer.work()) {
      $panel.addClass('panel-info');
      $panel.removeClass('panel-success');
    }
    else {
      $panel.addClass('panel-success');
      $panel.removeClass('panel-info');
    }

    if (!this_timer.active()) {
      $('#btn_timer_toggle').html("<i class='fa fa-play fa-fw'></i>Start");
    } else {
      $('#btn_timer_toggle').html("<i class='fa fa-pause fa-fw'></i>Pause");
    }
  }

  $('#btn_timer_toggle').on('click', function() {
    timer.toggle();
    updateDisplayCallback(timer);
  });

  $('#btn_timer_reset').on('click', function() {
    timer.reset();
    updateDisplayCallback(timer);
  });

  $('#decrement_pomodoro_time').on('click', function() {
    timer.updatePomodoroTime(-1);
  });
  $('#decrement_pomodoro_time_fast').on('click', function() {
    timer.updatePomodoroTime(-5);
  });
  $('#increment_pomodoro_time').on('click', function() {
    timer.updatePomodoroTime(1);
  });
  $('#increment_pomodoro_time_fast').on('click', function() {
    timer.updatePomodoroTime(5);
  });

  $('#decrement_break_time_fast').on('click', function() {
    timer.updateBreakTime(-5);
  });
  $('#decrement_break_time').on('click', function() {
    timer.updateBreakTime(-1);
  });
  $('#increment_break_time').on('click', function() {
    timer.updateBreakTime(1);
  });
  $('#increment_break_time_fast').on('click', function() {
    timer.updateBreakTime(5);
  });
});