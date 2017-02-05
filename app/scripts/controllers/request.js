'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:RequestCtrl
 * @description
 * # RequestCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('RequestCtrl', function ($scope, $window,$timeout, constants, api, $state, modal, $rootScope, $filter) {
    $scope.request_status = constants.request_status;
    $scope.Records = false;

  $rootScope.$on("incoming_request", function(event, data){
      $scope.records.push(data);
  });

  $scope.setFormat = function(){
    if(!$scope.filter){
      $scope.filter = {};
      $scope.filter._ini = $filter('date')($scope.dt, 'yyyy-MM-dd');
    }else{
      $scope.filter._ini = $filter('date')($scope.dt, 'yyyy-MM-dd');
    }
  }

  $scope.today = function() {
    $scope.dt = new Date();
  };

  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[1];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup2 = {
    opened: false
  };


  $scope.setFormatEnd = function(){
    if(!$scope.filter){
      $scope.filter = {};
      $scope.filter._end = $filter('date')($scope.dtEnd, 'yyyy-MM-dd');
    }else{
      $scope.filter._end = $filter('date')($scope.dtEnd, 'yyyy-MM-dd');
    }
  }

  $scope.todayEnd = function() {
    $scope.dtEnd = new Date();
  };

  $scope.todayEnd();

  $scope.clearEdt = function() {
    $scope.dtEnd = null;
  };

  $scope.dateOptionsEnd = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.openEnd = function() {
    $scope.popupEnd.opened = true;
  };

  $scope.setDateEnd = function(year, month, day) {
    $scope.dtEnd = new Date(year, month, day);
  };

  $scope.formatsEnd = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.formatEnd = $scope.formatsEnd[1];
  $scope.popupEnd = {
    opened: false
  };

  
   $scope.load = function(){
      api.pedido().get().success(function(res){
          $scope.records = res || [];
          $scope.Records = true;          
      });
    }

    $scope.location = function(){
        if(!this.record.data.geo){
              sweetAlert("Ups", "Coordenadas no disponibles", "warning");
            return;
        }

        $scope.ubicacion = this.record.data.geo;
        modal.show({templateUrl : 'views/ordenes/localizacion.html', size :'md', scope : $scope, backdrop:'static'}, function($scope){
            $scope.$close();
        });
    }

    $scope.delete = function(){
        var _record = this.record;

        modal.removeConfirm({closeOnConfirm : true}, 
            function(isConfirm){ 
               if (isConfirm) {
            api.pedido(_record._id).delete().success(function(res){
                  sweetAlert("Correcto", "Se ha eliminado este registro", "success");
                        $scope.records.splice($scope.records.indexOf(_record), 1);
            });
               }
           })
    }

    $scope.detail = function(){
      $state.go('dashboard.detalle_pedido', {pedido: this.record._id});
    }
  
  $scope.myConfig = {
    valueField: 'status',
    labelField: 'status',
    placeholder: 'Estado',
    onInitialize: function(selectize){
      // receives the selectize object as an argument
    },
    maxItems: 1
  };
  });
