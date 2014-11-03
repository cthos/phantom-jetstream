var wp = require('webpage');

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
  },

  getPage : function (url) {
    var callUrl = this.baseUrl + '?url=' + url + '&api_key=' + this.apiKey;
    var page = wp.create();

    var self = this;

    page.onLoadFinished = function () {
      var res = JSON.parse(page.plainText);
      self.addResultsToReport(res);
    };
  },

  addResultsToReport : function(results) {
    this.report.addToSection('Google Pagespeed', {item : 'Score', value : results.score});
  }
};

var GooglePSFormatter = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }
};

GooglePSFormatter.prototype = {
  // TODO: Implement
  format : function (item, style) {
    return item.url + ' - ' + item.speed + ' ms';
  }
};
