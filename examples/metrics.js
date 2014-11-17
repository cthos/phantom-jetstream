var page = require('webpage').create();
var JetStream = require('phantom-jetstream');

var landingPage = new JetStream.PageSpeed(page, "http://www.alextheward.com")
                               .logResourceSpeed(false)
                               .logPageSpeed(false)
                               .logCache(false)
                               .exitOnFinish(false);

var mt = new JetStream.Metrics.MetricTracker();
mt.addMetric('page-speed', '3000');
mt.addMetric('resource-speed', '200');

landingPage.metricTracker(mt);

var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('pageDone', function (event) {
  console.log(JSON.stringify(mt.testMetrics()));
  phantom.exit(1);
});

landingPage.open();
