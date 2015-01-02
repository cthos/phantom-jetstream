var JetStream = require('phantom-jetstream');

var pages = [
'portfolio',
'talks',
'blog',
];

var sspeed = new JetStream.SiteSpeed('http://alextheward.com', pages, '/tmp/sspeed/');
var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('siteDone', function (event) {
  console.log("DONE!");
  phantom.exit();
});

sspeed.run();
