var MetricTracker = function () {};

MetricTracker.prototype = {
  metrics : {},
  failingMetrics : [],

  addMetric : function (name, threshold) {
    this.metrics[name] = {
      'threshold' : threshold,
      'triggeringValues' : []
    };

    return this;
  },

  setMetric : function (name, amount, triggeringValue) {
    // We're not tracking this metric, so there's no threshold.
    if (!this.metrics[name]) {
      return;
    }

    if (!this.metrics[name] || !this.metrics[name].currentAmount) {
      this.metrics[name].currentAmount = amount;
      this.metrics[name].triggeringValues.push(triggeringValue);
      return this;
    }

    if (amount > this.metrics[name].currentAmount) {
      this.metrics[name].currentAmount = amount;
      this.metrics[name].triggeringValues.push(triggeringValue);
    }

    return this;
  },

  testMetrics : function () {
    for (var metric in this.metrics) {
      if (this.metrics[metric].currentAmount > this.metrics[metric].threshold) {
        var metricMessage = "Metric (" + metric + ") failed. Current value: " +
          this.metrics[metric].currentAmount + " / Threshold : " + this.metrics[metric].threshold;

        if (this.metrics[metric].triggeringValues) {
          metricMessage += " // Triggering Values : " + this.metrics[metric].triggeringValues.join(', ');
        }
        this.failingMetrics.push({message: metricMessage, amount: this.metrics[metric].currentAmount});
      }
    }

    return this.failingMetrics;
  }
};

module.exports.MetricTracker = MetricTracker;
