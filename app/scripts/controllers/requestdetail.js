'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:RequestdetailCtrl
 * @description
 * # RequestdetailCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('RequestdetailCtrl', function ($scope, api, $stateParams, $state) {
  	$scope.load = function(){
      $scope.Records = false; 
  		api.pedido($stateParams.pedido).get().success(function(res){
  			$scope.record = res;
        $scope.Records = true;
  		});
  	}

    $scope.facturar = function(){
      $state.go('dashboard.facturacion-pedido', {pedido : $stateParams.pedido});
    }

    $scope.getCantidades = function(){
      var cantidad = 0;

      angular.forEach(this.record.data.tallas, function(cur){
        cantidad = (cantidad + cur.cantidad || 0)
      });

      this.record.cantidadesTallas = cantidad;
    }

  });
