'use strict';

var _ = require('lodash');
var Stock = require('./stock.model');
var request = require('request');
var config = require('../../config/environment');

// Get list of stocks
exports.index = function(req, res) {
  //check if up to date data.
  Stock.find(function (err, stocks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(stocks);
  });
};

// Get a single stock
exports.show = function(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if(err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    return res.json(stock);
  });
};

// Creates a new stock in the DB.
exports.create = function(req, res) {
  var startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  console.log(startDate);
  var options = {
    port: 443,
    url: 'https://quandl.com/api/v3/datasets/WIKI/' + req.body.name + '.json',
    method: 'GET',
    json: true,
    qs: {
      api_key: config.quandl.api_key,
      start_date: startDate,
      column_index: 4
    }
  };

  var quandl = request(options, function(error, resp, body) {
    if(error){return handleError(res, err);}
    if(!body.dataset){return res.status(404).send('Not Found');}
    var splitMe = _.zip(body.dataset.data);
    var data = {
      name: body.dataset.name,
      code: body.dataset.dataset_code,
      dates: splitMe[0],
      closing_price: splitMe[1]
    };
    Stock.create(data, function(err, stock) {
      if(err) { return handleError(res, err); }
      return res.status(201).json(stock);
    });
  });
};

// Updates an existing stock in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Stock.findById(req.params.id, function (err, stock) {
    if (err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    var updated = _.merge(stock, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(stock);
    });
  });
};

// Deletes a stock from the DB.
exports.destroy = function(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if(err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    stock.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
