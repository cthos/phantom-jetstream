var wp = require('webpage');
var page = wp.create();
var JetStream = require('phantom-jetstream');

var landingPage = new JetStream.PageSpeed(page, "http://www.alextheward.com")
                               .logResourceSpeed(false)
                               .logPageSpeed(false)
                               .logCache(false)
                               .writeReportOnFinish(false)
                               .exitOnFinish(false);

var ev = JetStream.Event.EventDispatcher.getInstance();
var output = new JetStream.Output.HtmlOutput();
var rp = new JetStream.Reports.Report('output.html', output);

ev.bind('pageDone', function (event) {
  console.log("Starting Pagespeed");
  var ps = new JetStream.GooglePagespeed.GooglePageSpeed('KEY REDACTED');
  ps.setReport(rp);
  ps.getPage('http://www.alextheward.com');
});

ev.bind('googlePSDone', function(event) {
  console.log("Pagespeed done.")
  rp.write();
  phantom.exit();
});

landingPage.reportGenerator(rp);
landingPage.open();
