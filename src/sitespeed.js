var Event = require('./event');
var PageSpeed = require('./page_speed');
var Output = require('./output');
var Reports = require('./report');
var wp = require('webpage');

var SiteSpeed = function (baseSite, pages, outputDir) {
  this.pages = pages;
  this.baseSite = baseSite;
  this.outputDir = outputDir;
};

SiteSpeed.prototype = {
  ev : null,
  pageFiles : {},
  pageStack : [],

  run : function () {
    this.setUp();
    this.next();
  },

  next : function () {
    if (!this.pageStack.length) {
      this.ev.emit('siteDone');
      return;
    }

    var np = this.pageStack.pop();
    var pageUrl = this.baseSite + '/' + np;

    var page = new PageSpeed(wp.create(), pageUrl)
        .logResourceSpeed(false)
        .logPageSpeed(false)
        .logCache(false)
        .exitOnFinish(false);

    // Todo: Allow other output formats to be set.
    var output = new Output.HtmlOutput();
    var report = new Reports.Report(this.outputDir + '/' + this.pageFiles[np], output);
    // Wouldn't it be nice if there were just a .values?
    for (var key in this.pageFiles) {
      report.addPage(this.pageFiles[key]);
    }

    page.reportGenerator(report);
    page.open();
  },

  setUp : function () {
    this.pageStack = this.pages;

    for (var i = 0, len = this.pages.length; i < len; i++) {
      this.pageFiles[this.pages[i]] = this.pages[i] + '.html';
    }

    this.ev = Event.EventDispatcher.getInstance();
    var self = this;

    this.ev.bind('pageDone', function (event) {
      self.next();
    });
  }
};

module.exports = SiteSpeed;
