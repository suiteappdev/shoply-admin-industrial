'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:CategoriaCtrl
 * @description
 * # CategoriaCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('LotesCtrl', function ($scope, modal, api, $stateParams, sweetAlert, $http) {
    $scope.Records = false; 

    $scope.load = function(){
      if($stateParams.requests){
        $scope.requests = $stateParams.requests;
        $scope.loteTotal  =  $stateParams.loteTotal;
        $scope.observacion = $stateParams.observacion;
      }

      api.lotes().get().success(function(res){
        $scope.records = res || [];
        $scope.Records = true; 
      });
    };

    $scope.getProduced = function(){
        this.record.produced = this.record.data.request.filter(function(record){
            return record.add;
        }).length;
    }

    $scope.getExcluded = function(){
        this.record.excluded = this.record.data.request.filter(function(record){
            return !record.add;
        }).length;
    }

    $scope.MostrarTallasCantidades = function(allowWrite){
      $scope.set = this.record;
      $scope.allowWrite = allowWrite;
      modal.show({templateUrl : 'views/ordenes/TallasCantidades.html', size :'md', scope : $scope, backdrop:'static'}, function($scope){
        $scope.$close();
      });
    }

    $scope.MostrarMateriales = function(allowWrite){
      $scope.components = this.record.component;
      $scope.totalTallas = this.record.totalTallas;

      modal.show({templateUrl : 'views/lotes/materiales.html', size :'lg', scope : $scope, backdrop:'static'}, function($scope){
          $scope.$close();
      });
    }

    $scope.listado = function(data){
      if(data){
          $scope.listadoProducts = data;
      }else{
          $scope.listadoProducts = angular.copy(this.record.data.request);
      }
      
      window.modal = modal.show({templateUrl : 'views/lotes/listado.html', size :'lg', scope: $scope, backdrop:'static'}, function($scope){
          $scope.$close();
      }); 
    }

    $scope.producir = function(){
      $scope.loteActual = this.record;
      $scope.productionDate = new Date();
      $scope.productionRequestRecords = [];
      $scope.formProduction = {};
      $scope.formProduction.data = {}
      $scope.formProduction.data.observacion = this.record.data.observacion;
      $scope.formProduction.data.lote = this.record;

      window.modal = modal.show({templateUrl : 'views/produccion/agregarProduccion.html', size :'lg', scope: $scope, backdrop:'static'}, function($scope){
          
          api.producciones().post($scope.formProduction).success(function(res){
            sweetAlert.swal("Registro completado.", "has registrado una nueva produccion.", "success");

              res.data.lote.data.estado = "Producido";

              api.lotes(res.data.lote._id).put(res.data.lote).success(function(response){
                $scope.loteActual.data.estado = "Producido";
              });


            $scope.loteActual.produced =  $scope.loteActual.data.request.filter(function(record){
                return record.add;
            }).length;

            $scope.loteActual.excluded =  $scope.loteActual.data.request.filter(function(record){
                return !record.add;
            }).length;


            delete $scope.formProduction;
            $scope.$close();
          });

      }); 
    }

    $scope.validateLote = function(){

      if(!$scope.formProduction.data.loteTotal){
        toastr.error('Digite el lote total de productos!' , {timeOut: 10000});
        return;
      }

      $scope.totalTallas  = 0;

      $scope.productionRequest = $scope.data.currentPageFiltered.filter(function(request){
          return request.add
      });

      $scope.LoteRecords = []
      
      for (var i = 0; i < $scope.productionRequest.length; i++) {
            $scope.totalTallas =  ($scope.totalTallas + $scope.productionRequest[i].totalTallas || 0);
            $scope.LoteRecords.push($scope.productionRequest[i]);
      };
      
      if($scope.totalTallas > $scope.formProduction.data.loteTotal){
          toastr.warning('Has Sobrepasado el lote total de productos!' , {timeOut: 10000});
      }
    }

    $scope.agregar = function(){
      window.modal = modal.show({templateUrl : 'views/lotes/crear_lotes.html', size :'md', scope: $scope, backdrop:'static'}, function($scope){
        if($scope.formLotes.$invalid){
             modal.incompleteForm();
            return;
        }

        $scope.form.data.request = $scope.$parent.requests;
        $scope.form.data.loteTotal  = $scope.$parent.loteTotal;

        api.lotes().post($scope.form).success(function(res){
            if(res){
                $scope.records.push(res);
                delete $scope.form.data;
                delete $scope.$parent.requests;
                $scope.$close();
                sweetAlert.swal("Registro Creado", "Registro creado correctamente.", "success");
            }
        });
      });
    }

    $scope.materialSummary = function(){
      this.record.materialTotal = ($scope.totalTallas * this.record.cantidad);
    }

    $scope.summary = function(){
      var record = this.record;

      if(this.record.data && this.record.data.tallas){
        var total = 0;
        for (var i = 0; i < this.record.data.tallas.length; i++) {
            total = total + this.record.data.tallas[i].cantidad;
        };

        this.record.totalTallas = total;   

        if(this.record && this.record.component){
          angular.forEach(this.record.component, function(component){
            component.totalMateriales = (component.cantidad * record.totalTallas);
          });
        }

      }
    }
 
    $scope.borrar = function(){
        var _record = this.record;

        modal.removeConfirm({closeOnConfirm : true}, 
            function(isConfirm){ 
               if (isConfirm) {
                    api.lotes(_record._id).delete().success(function(res){
                        if(res){
                            $scope.records.splice($scope.records.indexOf(_record), 1);
                        }
                    });
               }
           })
   }

    $scope.edit = function(){
      $scope.formEdit = angular.copy(this.record);
      window.modal = modal.show({templateUrl : 'views/iva/editar_ivas.html', size :'md', scope: $scope}, function($scope){
            if($scope.$$childTail.formEditIva.$invalid){
                 modal.incompleteForm();
                return;
            }

            api.lotes($scope.formEdit._id).put($scope.formEdit).success(function(res){
                if(res){
                    sweetAlert("Registro Modificado", "Registro modificado correctamente.", "success");
                    $scope.load();
                    $scope.$close();
                    delete $scope.formEdit;
                }
            });
      });
    }

  });
