'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:RequestCtrl
 * @description
 * # RequestCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('RequestCtrl', function ($scope, $window, $timeout, constants, api, $state, modal, $rootScope, $filter, sweetAlert) {
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

  $scope.data_export = [];
  
   $scope.load = function(){
      api.pedido().get().success(function(res){
          $scope.records = res || [];
          $scope.Records = true;

          for (var i = 0; i < $scope.records.length; i++) {
              for (var y = 0; y < $scope.records[i].shoppingCart.length; y++) {
                  var _row = {};
                  
                  _row.ref = $scope.records[i].shoppingCart[y].refMixed;
                  _row.descripcion = $scope.records[i].shoppingCart[y].producto;
                  _row.unidades = $scope.records[i].shoppingCart[y].cantidad;
                  _row.dcto = $scope.records[i].data.descuento || 0;
                  _row.costo =  $scope.records[i].shoppingCart[y].precio || 0;
                  
                  _row.precio_venta = $scope.records[i].shoppingCart[y].precio_VentaFacturado || $scope.records[i].shoppingCart[y].precio_Venta || 0                 
                  _row.valor_iva = $scope.records[i].shoppingCart[y].valor_iva
                  _row.valor_utilidad = $scope.records[i].shoppingCart[y].valor_utilidad || 0

                  _row.dcto = $scope.records[i].data.descuento || 0;
                  _row.numpedido = $scope.records[i].id;

                  $scope.data_export.push(_row);
              };
          };

      });
    }

    $scope.generateExport = function(){
      if(this.record && this.record.shoppingCart){
          this.single_data_export = [];

          for (var y = 0; y < this.record.shoppingCart.length; y++) {
              var _row = {};
              
              _row.ref = this.record.shoppingCart[y].refMixed;
              _row.descripcion = this.record.shoppingCart[y].producto;
              _row.unidades = this.record.shoppingCart[y].cantidad;
              _row.dcto = this.record.data.descuento || 0;
              _row.costo =  this.record.shoppingCart[y].precio || 0;
              
              _row.precio_venta = this.record.shoppingCart[y].precio_VentaFacturado || this.record.shoppingCart[y].precio_Venta || 0                 
              _row.valor_iva = this.record.shoppingCart[y].valor_iva
              _row.valor_utilidad = this.record.shoppingCart[y].valor_utilidad || 0

              _row.dcto = this.record.data.descuento || 0;
              _row.numpedido = this.record.id;

              this.single_data_export.push(_row);
          };        
      }

    }

    $scope.validateLote = function(){
      $scope.productionRequest = $scope.data.currentPageFiltered.filter(function(request){
          return request.add
      });

      $scope.LoteRecords = []
      
      for (var i = 0; i < $scope.productionRequest.length; i++) {
        for (var y = 0; y < $scope.productionRequest[i].shoppingCart.length; y++) {
            $scope.productionRequest[i].shoppingCart[y].pedido = $scope.productionRequest[i].id;
            $scope.productionRequest[i].shoppingCart[y]._client = $scope.productionRequest[i]._client || null;
            $scope.productionRequest[i].shoppingCart[y]._seller = $scope.productionRequest[i]._seller || null;
            $scope.productionRequest[i].shoppingCart[y].createdAt = $scope.productionRequest[i].createdAt || null;
            $scope.productionRequest[i].shoppingCart[y].updatedAt = $scope.productionRequest[i].updatedAt || null;

        $scope.LoteRecords.push($scope.productionRequest[i].shoppingCart[y]);
        };
      };

      if($scope.LoteRecords.length > $scope.loteTotal){
          toastr.warning('Has Sobrepasado el lote total de productos!' , {timeOut: 10000});
      }
    }

    $scope.addLote = function(){
      sweetAlert.swal({
        title: "NUEVO LOTE",
        text: "Escriba la cantidad del lote:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Cantidad"
      },
      function(inputValue){
        if (inputValue === false) return false;
        
        if (inputValue === "") {
          swal.showInputError("Necesitas escribir la cantidad del lote");
          return false
        }

        $scope.loteTotal = parseInt(inputValue || 0);

        if($scope.LoteRecords && $scope.LoteRecords.length > $scope.loteTotal  ){
            sweetAlert.swal("Oops...", "Las ordenes seleccionadas sobre pasan el numero de lote!", "error");
        }
        
        $window.sweetAlert.close();

      });
    }

    $scope.ToProductionRequest = function(){
      $scope.productionRequest = $scope.data.currentPageFiltered.filter(function(request){
          return request.add
      });

      $state.go('dashboard.vista-previa', {requests : $scope.productionRequest , loteTotal:$scope.loteTotal || 0 || []});
    }

    $scope.ToSingleProductionRequest = function(){
      $scope.productionRequest = [this.record];
      $state.go('dashboard.vista-previa', {requests : $scope.productionRequest || [], loteTotal:$scope.loteTotal });
    }

    $scope.location = function(){
        if(!this.record.data.geo){
              sweetAlert.swal("Ups", "Coordenadas no disponibles", "warning");
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
                  sweetAlert.swal("Correcto", "Se ha eliminado este registro", "success");
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
