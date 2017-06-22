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
        console.log("excluded", this.record)

        this.record.excluded = this.record.data.request.filter(function(record){
            return !record.add;
        }).length;
    }

    $scope.productionReport = function(){
      var data = angular.copy(this.record.data.request);
      
      var _allcomponents = [];

      for (var i = 0; i < data.length; i++) {
        if(data[i].component){
          for (var y = 0; y < data[i].component.length; y++) {
                _allcomponents.push(data[i].component[y]); 
          };          
        }
      };

      console.log("materiales", _allcomponents);


     var groups = _(_allcomponents).groupBy(function(o){
          return o._id._id
     });

     console.log("groups", groups)

     var out = _(groups).map(function(g, key) {
             return { type: groups[key][0]._id , val: _(g).reduce(function( m, x ) { return m + x.cantidad; }, 0) };
     });

     console.log("out", out);

      Handlebars.registerHelper('formatCurrency', function(value) {
          return $filter('currency')(value);
      });

  Handlebars.registerHelper("debug", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
   
    if (optionalValue) {
      console.log("Value");
      console.log("====================");
      console.log(optionalValue);
    }
  }); 

      $http.get('views/reports/production.html').success(function(res){
        var _template = Handlebars.compile(res);
        console.log("template", _template);

        var w = window.open("", "_blank", "scrollbars=yes,resizable=no,top=200,left=200,width=350");
        
        w.document.write(_template({_out : out}));
        w.print();
        w.close();
      });
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
             console.log("res", res);
              
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

      $scope.productionRequest = $scope.data.currentPageFiltered.filter(function(request){
          return request.add
      });

      $scope.LoteRecords = []
      
      for (var i = 0; i < $scope.productionRequest.length; i++) {
            $scope.LoteRecords.push($scope.productionRequest[i]);
      };
      
      if($scope.LoteRecords.length > $scope.formProduction.data.loteTotal){
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

    $scope.summary = function(){
      if(this.record.data && this.record.data.tallas){
        var total = 0;
        for (var i = 0; i < this.record.data.tallas.length; i++) {
            total = total + this.record.data.tallas[i].cantidad;
        };

        this.record.totalTallas = total;        
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
