var Output = require('./output');

var Report = function (file, output) {
  this.fs = require('fs');
  this.file = file;

  if (typeof output === 'undefined') {
    output = new Output.TextOutput();
  }

  this.output = output;
  this.pages = [];
};

Report.prototype = {
  sections: {},

  /**
   * Allows you to link multiple pages from the header.
   */
  addPage : function (page) {
    this.pages.push(page);
  },

  addSection : function (sectionName, formatter) {
    if (typeof formatter === 'undefined') {
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
    this.output.write(this.file, this);
  }
};

var DefaultFormatter = function () {};

DefaultFormatter.prototype = {
  dataStyle: 'preformatted',

  format : function (item, style) {
    var styleMethod = style + 'Format';
    if (style && typeof this[styleMethod] === 'function') {
      return this[styleMethod](item);
    }

    return JSON.stringify(item);
  },

  getEntryHeader : function () {
    return [{name: "Item", type: "string"}];
  },

  preformat: function (items) {
    return items;
  }
};

var SpeedFormatter = function () {};

SpeedFormatter.prototype = {
  dataStyle: 'table',

  format : function (item, style) {
    var styleMethod = style + 'Format';
    if (style && typeof this[styleMethod] === 'function') {
      return this[styleMethod](item);
    }
    if (item.url.indexOf('http') < 0) {
      item.url = item.url.substr(0, 100);
    }

    return item.url + ' - ' + item.speed + ' ms';
  },

  getEntryHeader : function () {
    return [{name: "URL", type: "string"}, {name: "Speed", type: "int"}];
  },

  htmlFormat : function (item) {
    if (item.url.indexOf('http') < 0) {
      item.url = item.url.substr(0, 100);
    }

    var cells = [
      {value: item.url, class:"table-url"},
      {value: item.speed}
    ];

    return TableItem.getInstance().format(cells);
  },

  preformat : function (items) {
    return items.sort(function (a, b) {
      if (a.speed === b.speed) {
        return 0;
      }
      if (a.speed < b.speed) {
        return 1;
      }

      return -1;
    });
  }
};

var TableItem = function () {
  this.hb = require('handlebars');
  this.fs = require('fs');
  this.template = this.fs.read('node_modules/phantom-jetstream/templates/component/table_item.html');
};

TableItem.prototype = {
  format : function (cells) {
    return this.hb.compile(this.template)({cells: cells});
  }
};

TableItem._instance = null;
TableItem.getInstance = function () {
  if (!TableItem._instance) {
    TableItem._instance = new TableItem();
  }

  return TableItem._instance;
};


module.exports.Report = Report;
module.exports.DefaultFormatter = DefaultFormatter;
module.exports.SpeedFormatter = SpeedFormatter;
module.exports.TableItem = TableItem;
