var page = require('webpage').create();
var PageSpeed = require('./page_speed');
var Reports = require('./report');

var landingPage = new PageSpeed(page, "http://www.alextheward.com")
                               .logResourceSpeed(true)
                               .logPageSpeed(true)
                               .logCache(true);

landingPage.reportGenerator(new Reports.Report('output.txt'));

landingPage.open();
