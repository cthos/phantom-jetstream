var Report = require('./report');

TextOutput = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.fs = require('fs');
};

TextOutput.prototype = {
  write: function (file, contents) {
    var stream = this.fs.open(file, 'w');

    for (var section in contents) {
      stream.write(section + '\n' + '============================\n');

      items = contents[section].content;
      formatter = contents[section].formatter;

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

HtmlOutput = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.fs = require('fs');
  this.hb = require('handlebars');
};

HtmlOutput.prototype = {
  write: function (file, contents) {
    var template = this.fs.read('node_modules/phantom-jetstream/templates/basic.html');
    var stream = this.fs.open(file, 'w');

    var sections = [];

    for (var section in contents) {
      var sect = {
        section : section,
        style : {}
      };

      var msgs = [];

      items = contents[section].content;
      formatter = contents[section].formatter;
      items = formatter.preformat(items);

      sect.style[formatter.dataStyle] = true;
      sect.headers = formatter.getEntryHeader();

      for (var i = 0, len = items.length; i < len; i++) {
        msgs.push(formatter.format(items[i], 'html'));
      }

      sect.msgs = msgs;
      sections.push(sect);
    }

    var compiled = this.hb.compile(template);
    var htmlContents = compiled({sections : sections});

    stream.write(htmlContents);
    stream.close();
  }
};

module.exports = {
  TextOutput: TextOutput,
  HtmlOutput: HtmlOutput
};
