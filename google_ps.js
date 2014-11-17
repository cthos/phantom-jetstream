var wp = require('webpage');
var ev = require('./event')

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
};

GooglePSFormatter.prototype = {
  preformat : function (items) {
    return items;
  },

  // TODO: Implement
  format : function (item, style) {
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

  // TODO: Implement
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

module.exports = {
  GooglePageSpeed : GooglePageSpeed,
  GooglePSFormatter : GooglePSFormatter
};
