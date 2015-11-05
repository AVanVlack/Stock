'use strict';

angular.module('vanvlackStockApp')
  .controller('MainCtrl', function ($scope, $http, socket, $timeout) {
    $scope.stockData = [];
    $scope.alerts = [];

    $http.get('/api/stocks').success(function(stockData) {
      $scope.stockData = stockData;
      socket.syncUpdates('stock', $scope.stockData, function(event, item, array){
        console.log(event);
        if (event === 'created'){
          var xsData = {};
          xsData[item.code] = 'x' + item.code;
          $scope.chart.load({
              xs: xsData,
              columns: [
                ['x' + item.code].concat(item.dates),
                [item.code].concat(item.closing_price)
              ]
          });
        }
        if (event === 'deleted'){
          $scope.chart.unload({
            ids: [item.code]
          });
        }
      });
      var y = [];
      var x = [];
      var xsData = {};
      $scope.stockData.forEach(function(item){
        y.push([item.code].concat(item.closing_price));
        x.push(['x' + item.code].concat(item.dates));
        xsData[item.code] = 'x' + item.code
      });
      $scope.chart = c3.generate({
        bindto: '#chart',
        data: {
          xs: xsData,
          columns: x.concat(y)
        },
        axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                rotate: 90,
                fit: false

            }
          }
        },
        point: {
          show: false
        },
        zoom: {
          enabled: true
        }
      });
    });

    $scope.addStock = function() {
      if($scope.newStock === '') {
        return;
      }
      $http.post('/api/stocks', { name: $scope.newStock });
      $scope.newStock = '';
    };

    $scope.deleteStock = function(stock) {
      $http.delete('/api/stocks/' + stock._id);
    };

    $scope.timeOut = function(){
      $timeout(function(){
        socket.unsyncUpdates('stock');
        $scope.alerts.push({msg: 'You have been disconected from the server! Refresh to reconnect.'});
      }, 1000 * 60 * 5 );
    }

    $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });

    $scope.timeOut();
  });
