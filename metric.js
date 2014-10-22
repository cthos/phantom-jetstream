var MetricTracker = function () {
  if (!this instanceof arguments.callee) {
    return new arguments.callee(page);
  }
};

MetricTracker.prototype = {
  metrics : {},
  failingMetrics : [],

  addMetric : function (name, threshold) {
    this.metrics[name] = {
      'threshold' : threshold
    };

    return this;
  },

  setMetric : function (name, amount) {
    if (!this.metricAmounts[name]) {
      this.metricAmounts[name].currentAmount = amount;
      return this;
    }

    if (amount > this.metricAmounts[name]) {
      this.metricAmounts[name].currentAmount = amount;
    }

    return this;
  },

  testMetrics : function () {
    for (var metric in this.metrics) {
      if (this.metricAmounts[metric] > this.metrics[metric]) {
        var metricMessage = "Metric (" + metric + ") failed. Current value: " +
          this.metrics[name].currentAmount + " / Threshold : " + this.metrics[name].threshold;
        this.failingMetrics.push();
      }
    }

    return this.failingMetrics;
  }
};

module.exports.MetricTracker = MetricTracker;
