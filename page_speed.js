var Reports = require('./report');

var PageSpeed = function (page, url) {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.page = page;
  this.url = url;
  this._loggingHandler = console.log;

  this.setupPage();
};

PageSpeed.prototype = {
  timer : {},
  resources: [],

  _logCache: false,
  _logResourceSpeed: false,
  _logPageSpeed: true,
  _exitOnFinish: true,

  _reportGenerator: null,
  _metricTracker : null,

  _numCacheMisses : 0,

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
        'headers': {}
      };
    };

    this.page.onResourceReceived = function(response) {
      if (response.stage != 'end') {
        return;
      }

      self.careAboutHeaders(self.resources[response.url], response);

      var stopTime = new Date(response.time).getTime();
      var reqTime = stopTime - self.resources[response.url].startTime;

      self.log(response.url + " loaded in " + reqTime + " ms.", self._logResourceSpeed);
      self.addItemToReport('Resource Speed', {"speed" : reqTime, "url" : response.url});
      self.logMetric('resource-speed', reqTime);

      var cache = self.resources[response.url].headers['X-Cache'];

      if (cache && cache == 'MISS') {
        self.log(response.url + " CACHE MISS", self._logCache);
        self.addItemToReport("X-Cache Misses", response.url + " CACHE MISS");

        self._numCacheMisses++;

        self.logMetric('cache-misses', self._numCacheMisses);
      }

      self.timer.lastRequestTime = new Date().getTime();
    };

    setInterval(function () {
      var pageDone = self.checkForPageDone();

      if (pageDone) {
        clearInterval(this);
        self.writeReport();

        if (self._exitOnFinish) {
          phantom.exit();
        }
      }
    }, 5000);
  },

  setupReport : function () {
    this._reportGenerator.addSection('Page Speed');
    this._reportGenerator.addSection('Resource Speed', new Reports.SpeedFormatter());
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

  logMetric : function (metric, amount) {
    if (this._metricTracker) {
      this._metricTracker.setMetric(metric, amount);
    }

    return this;
  }

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
