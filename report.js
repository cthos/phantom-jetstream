Output = require('./output');

var Report = function (file, output) {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.fs = require('fs');
  this.file = file;

  if (typeof output == 'undefined') {
    output = new Output.TextOutput();
  }

  this.output = output;
};

Report.prototype = {
  sections: {},

  addSection : function (sectionName, formatter) {
    if (typeof formatter == 'undefined') {
      formatter = new DefaultFormatter();
    }

    this.sections[sectionName] = {
      'content' : [],
      'formatter' : formatter
    };
  },

  addToSection : function (section, item) {
    this.sections[section].content.push(item);
  },

  write : function () {
    this.output.write(this.file, this.sections);
  }
};

var DefaultFormatter = function () {};

// TODO: Clean up the style logic so it's actually clean.
// It's messy as it is right now.

DefaultFormatter.prototype = {
  format : function (item, style) {
    var styleMethod = style + 'Format';
    if (style && typeof this[styleMethod] == 'function') {
      return this[styleMethod](item);
    }

    return JSON.stringify(item);
  },
  preformat: function (items) {
    return items;
  }
};

var SpeedFormatter = function () {};

SpeedFormatter.prototype = {
  format : function (item, style) {
    var styleMethod = style + 'Format';
    if (style && typeof this[styleMethod] == 'function') {
      return this[styleMethod](item);
    }
    if (item.url.indexOf('http') < 0) {
      item.url = item.url.substr(0, 100);
    }

    return item.url + ' - ' + item.speed + ' ms';
  },

  tableFormat : function (item) {
    if (item.url.indexOf('http') < 0) {
      item.url = item.url.substr(0, 100);
    }

    return '<tr><td class="table-url">' + item.url + '</td><td>' + item.speed + ' ms</td></tr>';
  },

  preformat : function (items) {
    return items.sort(function (a, b) {
      if (a.speed == b.speed) {
        return 0;
      }
      if (a.speed < b.speed) {
        return 1;
      }

      return -1;
    });
  }
}

module.exports.Report = Report;
module.exports.DefaultFormatter = DefaultFormatter;
module.exports.SpeedFormatter = SpeedFormatter;
