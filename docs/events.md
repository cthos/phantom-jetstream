## pageDone

This event is emitted when the PageSpeed object has finished loading the page.

Typically it will be used to manually write a report, or to trigger some other processing after the page is done.

```js
var ev = JetStream.Event.EventDispatcher.getInstance();

ev.bind('pageDone', function (event) {  
  console.log("PAGE FINISHED!!!");
  phantom.exit();
});
```

## siteDone

Dispatched after the SiteSpeed class has finished iterating over all of its pages.

```js
ev.bind('siteDone', function (event) {
  console.log("DONE!");
  phantom.exit();
});
```

## siteSpeedBeforeNext

Called before the SiteSpeed object moves onto the next page in its list.

Turning autoNext off is a good way to control the flow of the SiteSpeed class via events.

`data` contains the site speed object itself as `data.sitespeed`.

```js
ev.bind('siteSpeedBeforeNext', function (event, data) {
  var ps = new JetStream.GooglePagespeed.GooglePageSpeed('AIzaSyBZkxYBorBK_W0UH3klqs0FOFTDpIph0Xg');
  ps.setReport(sspeed.currentReport);
  ps.getPage(sspeed.currentUrl);
});
```

## googlePSDone

Fired when the Google PageSpeed plugin addon has done its thing.

`data` contains the google pagespeed object in the `data.goog` parameter.

```js
ev.bind('googlePSDone', function(event, data) {
  console.log("Donney done done. Writing report.");
  sspeed.currentReport.write();
  sspeed.next();
});
```
