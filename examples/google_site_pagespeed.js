var JetStream = require('phantom-jetstream');

var pages = [
'portfolio',
'talks',
'blog',
];

var sspeed = new JetStream.SiteSpeed('http://alextheward.com', pages, '/tmp/sspeed/');
sspeed.autoNext(false);
var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('siteSpeedBeforeNext', function (event, data) {
  console.log("Next.");
  var ps = new JetStream.GooglePagespeed.GooglePageSpeed('****************');
  ps.setReport(sspeed.currentReport);
  ps.getPage(sspeed.currentUrl);
});

ev.bind('googlePSDone', function(event, data) {
  console.log("Donney done done. Writing report.");
  sspeed.currentReport.write();
  sspeed.next();
});

ev.bind('siteDone', function (event) {
  console.log("DONE!");
  phantom.exit();
});

sspeed.run();
