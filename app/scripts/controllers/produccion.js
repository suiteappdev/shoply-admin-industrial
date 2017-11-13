'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:ProductosCtrl
 * @description
 * # ProductosCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('ProduccionCtrl',["$scope", "$rootScope", "modal", "api", "constants", "$state","storage", "$http",  function ($scope, $rootScope, modal, api, constants, $state, storage, $http) {
    $scope.Records = false; 
    $scope.recordsProductos = [];

    $scope.load = function(){
      api.producciones().get().success(function(res){
        $scope.records = res || [];
        $scope.Records = true;
      });
    }


    $scope.getProduced = function(){
        this.record.produced = this.record.data.lote.data.request.filter(function(record){
            return record.add;
        }).length;
    }

    $scope.getExcluded = function(){
        this.record.excluded = this.record.data.lote.data.request.filter(function(record){
            return !record.add;
        }).length;
    }


    $scope.productionReportCustom = function(){
       var data = angular.copy(this.record.data.lote.data.request);
      
       var _allcomponents = [];

      $scope.conColor = [];

      for (var i = 0; i < data.length; i++) {
        if(data[i].component){
          for (var y = 0; y < data[i].component.length; y++) {
                if(data[i].component[y].colorRequest){
                  var exist = _allcomponents.filter(function(cur){
                      return data[i].component[y]._id._id == cur._id._id && data[i].component[y].colorRequest.color == cur.colorRequest.color;
                  })[0]; 

                    console.log("exist?", exist);
                    if(!exist){
                        if(data[i].component[y]._id.data.conversion){
                              data[i].component[y].totalMateriales = data[i].component[y].totalMateriales / (data[i].component[y]._id.data.conversion.areaVolumen * data[i].component[y]._id.data.conversion.unidadCantidad)  
                        }
                        _allcomponents.push(data[i].component[y]);
                        console.log("entra cuando no existe", data[i].component[y]);
                    }else{
                           var index = _allcomponents.indexOf(exist);
                           console.log("el producto existe en el  array", exist);

                          if(data[i].component[y]._id.data.conversion){
                              if(index > -1){
                                   console.log("tiene conversion y entro en la operacion", _allcomponents[index]);
                                  _allcomponents[index].totalMateriales = (_allcomponents[index].totalMateriales + data[i].component[y].totalMateriales );
                                  _allcomponents[index].totalMateriales = _allcomponents[index].totalMateriales / (data[i].component[y]._id.data.conversion.areaVolumen * data[i].component[y]._id.data.conversion.unidadCantidad)
                              }                            
                            }else{
                               console.log("no tiene conversion y entro en la operacion", index);
                              _allcomponents[index].totalMateriales =  ((_allcomponents[index].totalMateriales + data[i].component[y].totalMateriales));
                            }
                    }                 
                }
          };       
        }
      };

      console.log("_allcomponents", _allcomponents);
      
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

      $http.get('views/reports/custom.html').success(function(res){
        var _template = Handlebars.compile(res);
        console.log("template", _template);

        var w = window.open("", "_blank", "scrollbars=yes,resizable=no,top=200,left=200,width=350");
        
        w.document.write(_template({_out : _allcomponents}));
        w.print();
        w.close();
      });
    }

    $scope.productionReport = function(){
      var data = angular.copy(this.record.data.lote.data.request);
      
      var _allcomponents = [];

      $scope.sinColor = [];

      for (var i = 0; i < data.length; i++) {
        if(data[i].component){
          for (var y = 0; y < data[i].component.length; y++) {
                _allcomponents.push(data[i].component[y]); 

                /*$scope.sinColor = _allcomponents.filter(function(component){
                    return !component.colorRequest;
                });*/
          };          
        }
      };

      console.log("materiales reporte estandar", _allcomponents);


     var groups = _(_allcomponents).groupBy(function(o){
          console.log("iterador groupBy", o)

          o._id.data.totalMateriales += o.totalMateriales;
          return o._id._id
     });


     console.log("GRUPOS", groups)


     var out = _(groups).map(function(g, key) {
             return { type: groups[key][0]._id , val: _(g).reduce(function( m, x ) { 
              console.log("m", m)
              console.log("x", x)

              return m + x.totalMateriales; 

            }, 0) };
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
    $scope.borrar = function(){
        var _record = this.record;

        modal.removeConfirm({closeOnConfirm : true}, 
            function(isConfirm){ 
               if (isConfirm) {
                    api.producciones(_record._id).delete().success(function(res){
                        if(res){
                            $scope.records.splice($scope.records.indexOf(_record), 1);
                        }
                    });
               }
           })
   }
    
  }]);
