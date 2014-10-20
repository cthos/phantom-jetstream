Page = require('webpage');

var SiteSpeed = function (rootUrl, selector) {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }

  this.url = rootUrl;
};

SiteSpeed.prototype = {
  depth: 1,
  open : function () {

  },

  getSubPages: function (callback) {
    var targetPage = Page.create();
    var selector = this.selector;
    var self = this;

    targetPage.open();

    targetPage.includeJS('http://code.jquery.com/jquery-1.11.1.min.js',  function () {
      subPages = targetPage.page.evaluate(function () {
        var sp = [];

        $(selector).each(function () {
          sp.push($(this).attr('href'));
        });

        return sp;
      });

      callback.call(self, subPages);
    });
  },

  /**
   * Controls how many pages deep to search on selector
   */
  setDepth : function (depth) {
    this.depth = depth;

    return this;
  }
};
