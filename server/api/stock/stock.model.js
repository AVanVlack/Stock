'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StockSchema = new Schema({
  name: String,
  code: String,
  last_update: { type: Date, default: Date.now },
  dates: [],
  closing_price: [],
});

module.exports = mongoose.model('Stock', StockSchema);
