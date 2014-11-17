var wp = require('webpage');
var ev = require('./event');
var Report = require('./report');

var GooglePageSpeed = function (apiKey) {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.apiKey = apiKey;
};

GooglePageSpeed.prototype = {
  baseUrl : 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed',
  report : null,

  setReport : function (report) {
    this.report = report;
    this.report.addSection('Google Pagespeed', new GooglePSFormatter());
    this.report.addSection('Google Meter', new GoogleChartFormatter());
    this.report.addSection('Google Recommendations', new GoogleRecFormatter());
  },

  getPage : function (url) {
    var callUrl = this.baseUrl + '?url=' + url + '&api_key=' + this.apiKey;
    var page = wp.create();

    var self = this;

    page.onLoadFinished = function () {
      var res = JSON.parse(page.plainText);
      self.addResultsToReport(res);

      var disp = ev.EventDispatcher.getInstance();
      disp.emit('googlePSDone');

      page.close();
    };

    page.open(callUrl);
  },

  addResultsToReport : function(results) {
    this.report.addToSection('Google Pagespeed', {name : 'Score', value : results.score});
    this.report.addToSection('Google Pagespeed', {name : 'Number of Total Resources', value : results.pageStats.numberResources});
    this.report.addToSection('Google Pagespeed', {name : 'Number of JS Resources', value : results.pageStats.numberJsResources});
    this.report.addToSection('Google Pagespeed', {name : 'Number of CSS Resources', value : results.pageStats.numberCssResources});

    for (var name in results.formattedResults.ruleResults) {
      this.report.addToSection('Google Recommendations', results.formattedResults.ruleResults[name]);
    }

    this.report.addToSection('Google Meter', {
      chtt : 'Google Page Speed',
      chs : '180x100',
      cht : 'gom',
      chd : 't:' + results.score,
      chxt : 'x,y',
      chxl : '0:|' + results.score
    });
  }
};

var GooglePSFormatter = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.hb = require('handlebars');
  this.fs = require('fs');
  this.template = this.fs.read('node_modules/phantom-jetstream/templates/component/table_item.html');
};

GooglePSFormatter.prototype = {
  dataStyle: 'table',

  preformat : function (items) {
    return items;
  },

  // TODO: Implement
  format : function (item, style) {
    if (style == 'html') {
      var cells = [
        {value: item.name},
        {value: item.value}
      ];
      return Report.TableItem.getInstance().format(cells);
    }

    return item.name + ' - ' + item.value;
  }
};

var GoogleChartFormatter = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }
};

GoogleChartFormatter.prototype = {
  dataStyle : 'text',

  preformat : function (items) {
    return items;
  },

  format : function (item, style) {
    params = [];
    for (var it in item) {
      params.push(it + '=' + item[it]);
    }
    var src = 'https://chart.googleapis.com/chart?' + params.join('&');

    if (style == 'html') {
      return "<img src='" + src + "' />";
    }

    return src;
  }
};

var GoogleRecFormatter = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }
};

GoogleRecFormatter.prototype = {
  dataStyle : 'text',

  preformat : function (items) {
    return items;
  },

  format : function (item, style) {
    if (item.ruleImpact == 0) {
      return;
    }

    var name = item.localizedRuleName;
    var items = [];

    for (var i = 0, len = item.urlBlocks.length; i < len; i++) {
      var txt = this.textFormat(item.urlBlocks[i].header);
      items.push(txt);

      if (item.urlBlocks[i].urls) {
        for (var x = 0, xlen = item.urlBlocks[i].urls.length; x < xlen; x++) {
          items.push(this.textFormat(item.urlBlocks[i].urls[x].result));
        }
      }
    }

    // TODO: Real html?
    return "<h3>" + name + "</h3>" + items.join('<br>');
  },

  textFormat: function (item) {
    //console.log(JSON.stringify(item, null, 4));
    var txt = item.format;

    if (item.args) {
      for (var x = 0, xlen = item.args.length; x < xlen; x++) {
        txt = txt.replace('$' + (x+1), item.args[x].value);
      }
    }

    return txt;
  }
};

module.exports = {
  GooglePageSpeed : GooglePageSpeed,
  GooglePSFormatter : GooglePSFormatter
};
