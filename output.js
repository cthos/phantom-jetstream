TextOutput = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.fs = require('fs');
}

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

module.exports = {
  TextOutput: TextOutput
}
