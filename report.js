var Report = function (file) {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.fs = require('fs');
  this.file = file;
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
    var stream = this.fs.open(this.file, 'w');

    for (var section in this.sections) {
      stream.write(section + '\n' + '============================\n');

      items = this.sections[section].content;
      formatter = this.sections[section].formatter;

      items = formatter.preformat(items);

      for (var i = 0, len = items.length; i < len; i++) {
        var msg = formatter.format(items[i]);

        stream.write(msg + '\n');
      }

      stream.write("\n\n");
    }

    stream.close();
  }
};

var DefaultFormatter = function () {};

DefaultFormatter.prototype = {
  format : function (item) {
    return JSON.stringify(item);
  },
  preformat: function (items) {
    return items;
  }
};

var SpeedFormatter = function () {};

SpeedFormatter.prototype = {
  format : function (item) {
    return item.url + ' - ' + item.speed + ' ms';
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
