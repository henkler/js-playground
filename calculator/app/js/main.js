/*global $:true*/
function Calculator(updateDisplayResultCallback, updateDisplayHistoryCallback) {
  this.result;
  this.currentOperator;
  this.operand;
  this.historyString;

  this.updateDisplayResultCallback = updateDisplayResultCallback;
  this.updateDisplayHistoryCallback = updateDisplayHistoryCallback;

  this.reset();
}

Calculator.prototype = {
  constructor: Calculator,

  reset: function() {
    this.result = null;
    this.currentOperator = null;
    this.operand = '0';
    this.history = '';

    this.updateDisplayResult(this.operand);
    this.updateDisplayHistory();
  },

  getResult: function() {
    return this.result;
  },

  doCalculation: function(operator) {
    // do the calculation if we have both operands and an operator
    if (this.currentOperator && this.operand != '') {
      this.result = eval(this.result + ' ' + this.currentOperator + ' ' + this.operand);

      this.updateDisplayResult(this.result);
    }

    // special case - initial result calculation starts as null
    if (this.result == null) {
      this.result = parseFloat(this.operand);
    }

    // = operator clears history
    if (operator == '=') {
      this.history = '';
      this.currentOperator = null;
      this.operand = this.result.toString();
    }
    else {
      this.history += ' ' + this.operand + ' ' + operator;
      this.currentOperator = operator;
      this.operand = '';
    }
    this.updateDisplayHistory();
  },

  toggleNegative: function() {
    if (this.operand == '0') {
      return;
    }

    if (this.operand.match(/^\-/)) {
      this.operand = this.operand.slice(1);
    }
    else {
      this.operand = '-' + this.operand;
    }

    this.updateDisplayResult(this.operand);
  },

  parseInput: function(input) {
    switch (input) {
      case 'CE':
        this.reset();
        break;
      case 'C':
        this.operand = '0';
        this.updateDisplayResult(this.operand);
        break;
      case '+/-':
        this.toggleNegative();
        break;
      case '/':
      case '*':
      case '-':
      case '+':
      case '=':
        this.doCalculation(input);
        break;
      case '.':
        this.operand = this.operand.replace(/\./g, '');
        this.operand += '.';
        this.updateDisplayResult(this.operand);
        break;
      default:
        if (parseInt(input) != NaN) {
          if (this.operand == '0') {
            this.operand = '';
          }
          this.operand += input;
          this.updateDisplayResult(this.operand);
        }
    }
  },

  updateDisplayResult: function(val) {
    this.updateDisplayResultCallback(val);
  },

  updateDisplayHistory: function() {
    this.updateDisplayHistoryCallback(this.history);
  }
};

$(document).ready(function() {
  function updateDisplayResultCallback(val) {
    $('#result').text(val)
  }

  function updateDisplayHistoryCallback(history) {
    $('#history').text(history);
  }

  var calc = new Calculator(updateDisplayResultCallback, updateDisplayHistoryCallback);

  $('button').on('click', function() {
    var operation = $(this).text();
    calc.parseInput(operation);
  });

  // Allow the calculator to also work with keys on the keyboard!
  $(document).keypress(function(event) {
    var validKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','='];
    var keyPress;

    // key 13 = ENTER key.  Treat like = key
    if (event.which == 13) {
      keyPress = '=';
    }
    else {
      keyPress = String.fromCharCode(event.which);
    }

    // only handle keys we know what to do with
    // NOTE: key 13 = ENTER.
    if ($.inArray(keyPress, validKeys) > -1) {
      calc.parseInput(keyPress);
    }
  });

});