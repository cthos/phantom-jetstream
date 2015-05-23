var Reports = require('./report');
var Event = require('./event');
var u = require('url');

var PageSpeed = function (page, url) {
  this.page = page;
  this.url = url;
  this._loggingHandler = console.log;

  this._eventDispatcher = Event.EventDispatcher.getInstance();

  this.setupPage();
};

PageSpeed.prototype = {
  timer : {},
  resources: [],

  _logCache: false,
  _logResourceSpeed: false,
  _logPageSpeed: true,
  _exitOnFinish: true,
  _writeReportOnFinish: true,

  _reportGenerator: null,
  _metricTracker : null,

  _numCacheMisses : 0,

  exitOnFinish : function (ex) {
    this._exitOnFinish = ex;
    return this;
  },

  writeReportOnFinish : function (wr) {
    this._writeReportOnFinish = wr;
    return this;
  },

  /**
   * Setter for logging page speed.
   */
  logPageSpeed : function (log) {
    this._logPageSpeed = log;
    return this;
  },

  /**
   * Setter for logging resource speed.
   */
  logResourceSpeed : function (log) {
    this._logResourceSpeed = log;
    return this;
  },

  /**
   * Setter for logging cache.
   */
  logCache : function (log) {
    this._logCache = log;
    return this;
  },

  reportGenerator : function (rg) {
    this._reportGenerator = rg;
    this.setupReport();

    return this;
  },

  metricTracker : function (m) {
    this._metricTracker = m;
    return this;
  },

  /**
   * Sets up the page variables to log what we want to track.
   */
  setupPage : function () {
    var self = this;

    this.page.onLoadStarted = function () {
      self.timer.start = new Date().getTime();
    };

    this.page.onLoadFinished = function () {
      self.timer.end = new Date().getTime();

      self.timer.pagespeed = self.timer.end - self.timer.start;

      self.log("Page finished in " + self.timer.pagespeed + " ms", self._logPageSpeed);
      self.addItemToReport('Page Speed', self.timer.pagespeed + " ms");

      self.logMetric('page-speed', self.timer.pagespeed);
    };

    this.page.onResourceRequested = function(request) {
      self.resources[request.url] = {
        'startTime': new Date(request.time).getTime(),
        'headers': {},
        'size'   : 0,
        'url'    : request.url
      };
    };

    this.page.onResourceError = function (err) {
      if (err.errorCode === 6) {
        console.log("SSL Error detected. Try running phantom with " +
        "--ignore-ssl-errors=yes and --ssl-protocol=any");

        self.page.close();
        phantom.exit();
      } else {
        console.log("Error detected. Message: " + err.errorString);
      }
    };

    this.page.onResourceReceived = function(response) {
      if (response.bodySize && response.bodySize > self.resources[response.url].size) {
        self.resources[response.url].size = response.bodySize;
      }

      if (response.stage !== 'end') {
        return;
      }

      self.careAboutHeaders(self.resources[response.url], response);

      var stopTime = new Date(response.time).getTime();
      var reqTime = stopTime - self.resources[response.url].startTime;

      var contentLength = self.resources[response.url].headers['Content-Length'];

      self.log(response.url + " loaded in " + reqTime + " ms.", self._logResourceSpeed);

      // Parse out the main url when adding stuff to the report if it's the same
      var mainUrl = u.parse(self.url);
      var rUrl = u.parse(response.url);
      var size = contentLength ? contentLength : self.resources[response.url].size;
      var pathName = mainUrl.host === rUrl.host ? rUrl.pathname : rUrl.host + rUrl.pathname;

      self.addItemToReport('Resources', {
        "speed" : reqTime,
        "url" : pathName,
        "size": size
      });

      self.logMetric('resource-speed', reqTime, pathName);
      self.logMetric('resource-size', size, pathName);

      var cache = self.resources[response.url].headers['X-Cache'];

      if (cache && cache === 'MISS') {
        self.log(response.url + " CACHE MISS", self._logCache);
        self.addItemToReport("X-Cache Misses", response.url + " CACHE MISS");

        self._numCacheMisses++;

        self.logMetric('cache-misses', self._numCacheMisses);
      }

      self._eventDispatcher.emit('resourceReceived', self.resources[response.url]);

      self.timer.lastRequestTime = new Date().getTime();
    };

    var pageDoneInterval = setInterval(function () {
      var pageDone = self.checkForPageDone();

      if (pageDone) {
        if (self._writeReportOnFinish) {
          self.writeReport();
        }

        self.page.close();

        if (self._exitOnFinish) {
          phantom.exit();
        }

        clearInterval(pageDoneInterval);
        self._eventDispatcher.emit('pageDone');
      }
    }, 5000);
  },

  setupReport : function () {
    this._reportGenerator.addSection('Page Speed');
    this._reportGenerator.addSection('Resources', new Reports.ResourceFormatter());
    this._reportGenerator.addSection("X-Cache Misses");
  },

  /**
   * Gets the headers out of the response object and tacks them onto obj as kv pair
   */
  careAboutHeaders : function (obj, resp) {
    for (var i = 0, len = resp.headers.length; i < len; i++) {
      obj.headers[resp.headers[i].name] = resp.headers[i].value;
    }
  },

  /**
   * TODO: Finish this thing.
   *
   * Intended to click around a given selector.
   */
  navigateAround : function (selector) {
    this.page.includeJS('http://code.jquery.com/jquery-1.11.1.min.js',  function () {
      this.page.evaluate(function () {
        $(selector).each(function () {
          $(this).click();
        });
      });
    });
  },

  addItemToReport: function (section, item) {
    if (!this._reportGenerator) {
      return;
    }

    this._reportGenerator.addToSection(section, item);
  },

  logMetric : function (metric, amount, triggeringValue) {
    if (this._metricTracker) {
      this._metricTracker.setMetric(metric, amount, triggeringValue);
    }

    return this;
  },

  writeReport: function () {
    if (!this._reportGenerator) {
      return;
    }

    this._reportGenerator.write();
  },

  /**
   * Gets the party started.
   */
  open : function () {
    this.page.open(this.url);
    return this;
  },

  /**
   * Wrapper around the logging handler (defaults to console.log)
   */
  log : function (string, doLog) {
    if (!doLog) {
      return;
    }

    if (this._loggingHandler === console.log) {
      this._loggingHandler.call(console, string);
    }
  },

  checkForPageDone: function () {
    if (!this.timer.lastRequestTime) {
      return false;
    }

    var currentTime = new Date().getTime();

    if (currentTime - this.timer.lastRequestTime < 5000) {
      return false;
    }

    this.log("Resources finished loading in "  + (this.timer.lastRequestTime - this.timer.start) + " ms", this._logResourceSpeed);
    return true;
  }
};

module.exports = PageSpeed;
