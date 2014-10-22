## Phantom-Jetstream

Just a quick script for PhantomJS which logs page load speed, resource load speed and Varnish X-Cache misses.

Eventually this could be something a bit more useful.

## Installation

```bash
npm install cthos/phantom-jetstream
```

*Note:* I haven't tested this as a global install.

## Package Contents

The module defines several exports in main.js. You can see the various ones by looking in there.

Quick overview:

### PageSpeed

This is the main entry point class which does all of the heavy page lifting. You give it a phantom page object and the url
which it should open (that's a little clunky, I might move the url to the open method), and you can chain various
options to it.

Example:

```js
var JetStream = require('phantom-jetstream');

var landingPage = new JetStream.PageSpeed(page, "http://www.alextheward.com")
                               .logResourceSpeed(true)
                               .logPageSpeed(true)
                               .logCache(true)
                               .open();
```

### Reports

This contains the logic to determine which reporting structure you want the results logged to.

By default, PageSpeed will not log to anything, and will just output the selected metrics to the commandline (without sorting).

With Reports, you can specify a file to output the metrics to (regardless of logging level), and it will do fancy things like
sorting the resources by slowest first.

Example:

```js
landingPage.reportGenerator(new JetStream.Reports.Report('output.txt'));
```

### Output

The output classes determine what the output of the Report class is, and defaults to TextOutput. There are no other output formats at this time.

### Metrics

phantom-jetstream allows for the simple collection of a few highwater-type metrics. It will log the longest resource time, as well as the final
page request speed, and allow you to define fail thresholds for that data. Simple example:

```js

landingPage.exitOnFinish(false);

var mt = new JetStream.Metrics.MetricTracker();
mt.addMetric('page-speed', '1000');
mt.addMetric('resource-speed', '200');

landingPage.metricTracker(mt);

var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('pageDone', function (event) {
  var failingMetrics = mt.testMetrics();
  console.log(JSON.stringify(failingMetrics));

  phantom.exit(failingMetrics.length ? 1 : 0);
});
```

### Event

phantom-jetstream is bundled with a bare-bones event dispatcher. Currently it only emits the `pageDone` event so the external script can call phantom.exit() on its own, assuming PageSpeed is configured to not exit on page stop.

```js
var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('pageDone', function (event) {  
  console.log("PAGE FINISHED!!!");
  phantom.exit();
});
```
