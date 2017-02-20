'use strict';

/**
 * @ngdoc function
 * @name shoplyApp.controller:ProductosCtrl
 * @description
 * # ProductosCtrl
 * Controller of the shoplyApp
 */
angular.module('shoplyApp')
  .controller('ProductosCtrl',["$scope", "$rootScope", "modal", "api", "constants", "$state","storage",  function ($scope, $rootScope, modal, api, constants, $state, storage) {
    $scope.Records = false; 
    $scope.recordsProductos = [];
    $scope.recordsServices = [];

    $scope.load = function(){
      api.producto().get().success(function(res){
        $scope.records = res || [];
        $scope.Records = true;
      });

      if(angular.fromJson(storage.get('recentColors'))){
          $scope.recentsColors = angular.fromJson(storage.get('recentColors'));
      }
    }

    $scope.loadRecent = function(){
      $scope.form.data.color = $scope.recentsColors;
    }

    $scope.addColor = function(){
      if(!$scope.form.data.color){
        $scope.form.data.color = [];
        $scope.form.data.color.push({descripcion : $scope.apariencia.descripcionColor, color : $scope.apariencia.color});
        storage.save('recentColors', $scope.form.data.color);
      }else{
        $scope.form.data.color.push({descripcion : $scope.apariencia.descripcionColor, color : $scope.apariencia.color});
         storage.save('recentColors', $scope.form.data.color);
      }

      delete $scope.apariencia;
    }

    $scope.removeColor = function(){
      $scope.form.data.color.splice($scope.form.data.color.indexOf(this.color), 1);
    }

    $scope.addColorEdit = function(){
      if(!$scope.formEdit.data.color){
        $scope.formEdit.data.color = [];
        $scope.formEdit.data.color.push({descripcion : $scope.apariencia.descripcionColor, color : $scope.apariencia.color});
      }else{
        $scope.formEdit.data.color.push({descripcion : $scope.apariencia.descripcionColor, color : $scope.apariencia.color});
      }

      delete $scope.apariencia;
    }

    $scope.removeColorEdit = function(){
      $scope.formEdit.data.color.splice($scope.formEdit.data.color.indexOf(this.color), 1);
    }

    $scope.verImpuestos = function(){
      $scope.record = this.record._iva;
      window.modal = modal.show({templateUrl : 'views/productos/verIvas.html', size :'sm', scope: $scope, backdrop:'static'}, function($scope){
        $scope.$close();
      });
    }

    $scope.$watch('_grocery', function(n, o){
      delete $scope.total;
      if(n){
        api.cantidades().add('stock/' + n).add('/' + $scope.formEdit._id).get().success(function(res){
          $scope.stocks = res;
          if($scope.stocks.length == 0){
            $scope.msg = 'No se encontraron movimientos en esta bodega';
          }else{
            delete $scope.msg;
          }
        });
      }
    });

    $scope.onTypeQty = function(){
      this.record.data.baseComponent = (this.record.precio * this.record.data.cantidad); 
      this.record.data.baseIva = (this.record.precio + this.record.valor_iva) * this.record.data.cantidad; 
    }

    $scope.onTypeQtyEdit = function(){
      this.record.data.baseComponent = (this.record.precio * this.record.data.cantidad); 
      this.record.data.baseIva = (this.record.precio + this.record.valor_iva) * this.record.data.cantidad; 
    }

    $scope.onTypeQtyEditComponent = function(){
      this.record.data.baseComponent = (this.record.precio * this.record.data.cantidad); 
      this.record.data.baseIva = (this.record.precio + this.record.valor_iva) * this.record.data.cantidad; 
    }

    $scope.totalizeBase = function(){
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.recordsProductos.length; i++) {
            _total.push($scope.recordsProductos[i].data.baseComponent || $scope.recordsProductos[i].precio);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBase = total;

    }

    $scope.totalizeBaseServices = function(){
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.recordsServices.length; i++) {
            _total.push($scope.recordsServices[i].data.baseComponent || $scope.recordsServices[i].precio);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBaseService = total;
    }

    $scope.totalizeBaseComponentIva = function(){
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.recordsProductos.length; i++) {
            _total.push($scope.recordsProductos[i].data.baseIva || ($scope.recordsProductos[i].precio + $scope.recordsProductos[i].valor_iva) * $scope.recordsProductos[i].data.cantidad || 0);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBaseIva = total;
    }

    $scope.totalizeBaseComponentEdit = function(){
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.recordsProductosEdit.length; i++) {
            _total.push($scope.recordsProductosEdit[i].data.baseComponent || $scope.recordsProductosEdit[i].precio);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBaseEdit = total;
    }

    $scope.totalizeBaseServicesEdit = function(){
      console.log("this", this);
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.formEdit.data.services.length; i++) {
            _total.push($scope.formEdit.data.services[i].data.baseComponent || $scope.formEdit.data.services[i].precio);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBaseServiceEdit = total;
    }

    $scope.totalizeBaseComponentIvaEdit = function(){
        var _total = [];
        var total = 0;

        for (var i = 0; i < $scope.recordsProductosEdit.length; i++) {
            _total.push($scope.recordsProductosEdit[i].data.baseIva || ($scope.recordsProductosEdit[i].precio + $scope.recordsProductosEdit[i].valor_iva) * $scope.recordsProductosEdit[i].data.cantidad || 0);
        };


        for (var y = 0; y < _total.length; y++) {
            console.log("y", _total[y])
            total = (total + _total[y])
        };

        $scope.totalBaseIvaEdit = total;
    } 

    $scope.options = ['transparent','#FF8A80', '#FFD180', '#FFFF8D', '#CFD8DC', '#80D8FF', '#A7FFEB', '#CCFF90'];
    $scope.color = '#FF8A80';

    $scope.colorChanged = function(newColor, oldColor) {
        console.log('from ', oldColor, ' to ', newColor);
    }

    $scope.$watch('recordsProductos', function(n, o){
      if(n){
        if(n.length > 0){
            $scope.totalizeBase();
            $scope.totalizeBaseIva();

            if($scope.form.precio_venta <= $scope.totalBase){
                toastr.warning('El costo de este producto esta por debajo del valor total del los materiales');          
            }
        }
      }
    });

    $scope.$watch('recordsProductosEdit', function(n, o){
      if(n){
          $scope.totalizeBaseComponentEdit();
          $scope.totalizeBaseComponentIvaEdit();
      }
    }, true);

    $scope.removefromComponentList = function(){
      $scope.recordsProductos.splice($scope.recordsProductos.indexOf(this.record), 1);
    }    

    $scope.removefromComponentListEdit = function(){
      $scope.recordsProductosEdit.splice($scope.recordsProductosEdit.indexOf(this.record), 1);
    }

    $scope.$watch('_productAdd', function(n, o){
      if(n){
            $scope._productAddObj.data = {};
            $scope._productAddObj.data.cantidad = 1;

            $scope.recordsProductos.push($scope._productAddObj);
            $scope.form.data.component = $scope.recordsProductos.map(function(component){
              return {
                _id : component._id,
                cantidad : component.cantidad
              }
            });
      }
    }, true);

    $scope.$watch('_productAddEdit', function(n, o){
      if(n){
          $scope._productAddObjEdit.data = {};
          $scope._productAddObjEdit.data.cantidad = 1;
          
          if($scope.recordsProductosEdit){
             $scope.recordsProductosEdit.push($scope._productAddObjEdit);
          }else{
            $scope.recordsProductosEdit = [];
             $scope.recordsProductosEdit.push($scope._productAddObjEdit);
          }

          delete $scope._productAddEdit;
      }
    }, true);

    //service watcher
    $scope.$watch('formEdit.data.services', function(n, o){
      if(n){
          $scope.totalizeBaseServicesEdit();
          
          if($scope.formEdit.data.precio <= $scope.totalBaseServiceEdit){
              toastr.warning('El costo de este producto esta por debajo del valor total del los servicios');          
          }
      }
    }, true);

    //service watcher
    $scope.$watch('recordsServices', function(n, o){
      if(n){
          $scope.totalizeBaseServices();
          $scope.form.data.precio  =  $scope.totalBaseService;
      }
    }, true);

    $scope.removeServicefromComponentList = function(){
      $scope.recordsServices.splice($scope.recordsServices.indexOf(this.record), 1);
    }    

    $scope.removeServiceFromListEdit = function(){
      $scope.formEdit.data.services.splice($scope.formEdit.data.services.indexOf(this.record), 1);
    }

    $scope.$watch('_serviceAdd', function(n, o){
      if(n){
            $scope.recordsServices.push($scope._serviceAddObj);
            $scope.form.data.services = $scope.recordsServices.map(function(services){
              return {
                _id : services._id
              }
            });
      }
    });

    $scope.$watch('_serviceAddEdit', function(n, o){
      if(n){
          if(!$scope.formEdit.data.services){
            $scope.formEdit.data.services = [];
            $scope._serviceAddObjEdit.data = {};
            $scope._serviceAddObjEdit.data.cantidad = 1;
            $scope.formEdit.data.services.push($scope._serviceAddObjEdit);
          }else{
            $scope._serviceAddObjEdit.data = {};
            $scope._serviceAddObjEdit.data.cantidad = 1;
            $scope.formEdit.data.services.push($scope._serviceAddObjEdit);
          }

          delete $scope._serviceAddEdit;
      }
    });


    $scope.getByProduct = function(){
        $scope.total = 0;
        api.cantidades().add('stock/' + $scope.formEdit._id).get().success(function(res){
          $scope.stocks = res;
          
          $scope.stocks.map(function(stock){
            $scope.total = ($scope.total + parseInt(stock.amount));

            return stock;
          });

          if($scope.stocks.length == 0){
            $scope.msg = 'No se encontraron movimientos en esta bodega';
          }else{
            delete $scope.msg;
          }
        });
    }

    $scope.detail = function(){
      var url = $state.href('dashboard.detalle_producto', { producto : $rootScope.grid.value._id});
      window.open(url, '_blank');
    }

    $scope.edit = function(){
      if($scope.recordsProductosEdit){
        delete $scope.recordsProductosEdit
        delete $scope.totalBaseEdit; 
        delete $scope.totalBaseIvaEdit;
      }

      if($scope.recordsServices){
        delete $scope.totalBaseServiceEdit;
      }

      $scope.formEdit = angular.copy(this.record);
      $scope.formEdit._category = this.record._category ? this.record._category._id : null;
      $scope.formEdit._commercial_home = this.record._commercial_home ? this.record._commercial_home._id : null;
      $scope.ivaValue = this.record._iva ? this.record._iva.data.valor : 0;

      $scope.formEdit._iva = this.record._iva ? this.record._iva._id : null;
      
      if($scope.formEdit.data.tags){
        $scope.tags = $scope.formEdit.data.tags.map(function(o){
            var _obj = new Object();
            _obj.text = o;
            _obj.value = o;

            return _obj;
        });        
      }

      if($scope.formEdit._reference.reference){
          $scope.reference = $scope.formEdit._reference.reference.map(function(o){
              var _obj = new Object();
              _obj.text = o;
              _obj.value = o;

              return _obj;
          });
      }

      if($scope.formEdit.data.component){
        $scope.recordsProductosEdit = $scope.formEdit.data.component.map(function(o){
              var _obj = new Object();
              _obj = o._id.data;
              _obj.data = {};
              _obj.data.cantidad = o.cantidad;
              _obj.iva = o._id._iva;
              _obj._reference = o._id._reference;
              _obj._category = o._id._category;
              _obj._id = o._id._id;
              _obj.idcomposed = o._id.idcomposed;

              return _obj
        });        
      }

      if($scope.formEdit.data.services){
        $scope.formEdit.data.services = $scope.formEdit.data.services.map(function(o){
              var _obj = new Object();
              console.log("o", o)
              _obj = o._id.data;
              
              _obj.data = {};
              _obj.data.cantidad = o.cantidad;
              
              _obj.iva = o._id._iva;
              _obj._reference = o._id._reference;
              _obj._category = o._id._category;
              _obj._id = o._id._id;
              _obj.idcomposed = o._id.idcomposed;

              return _obj
        });        
      }

      window.modal = modal.show({templateUrl : 'views/productos/editar_producto.html', size :'lg', scope: $scope, backdrop:'static'}, function($scope){
            if($scope.formProducto.$invalid){
                 modal.incompleteForm();
                return;
            }

           var form = angular.copy($scope.formEdit);
           
           if($scope.formEdit.data.services){
              form.data.services = angular.copy($scope.formEdit.data.services.map(function(service){
                return {
                  _id : service._id,
                  cantidad : service.data.cantidad
                }
              }));
           }

           if($scope.formEdit.data.component){
              form.data.component = angular.copy($scope.recordsProductosEdit.map(function(component){
                return {
                  _id : component._id,
                  cantidad : component.data.cantidad
                }
              }));
           }else{
              if($scope.recordsProductosEdit){
                form.data.component = angular.copy($scope.recordsProductosEdit.map(function(component){
                  return {
                    _id : component._id,
                    cantidad : component.data.cantidad
                  }
                }));              
              }
           } 

          api.producto($scope.formEdit._id).put(form).success(function(res){
              if(res){
                  sweetAlert("Registro Modificado", "Registro modificado correctamente.", "success");
                  $scope.load();
                  $scope.$close();
                  delete $scope.form.data;
              }
          });
      });
    }

    $scope.$watch('form.data.precio', function(n, o){
      try{
        var _valor_iva = ((parseInt($scope.iva ? $scope.iva.valor : 0) / 100) * $scope.form.data.precio  || 0); 
        var _valor_utilidad = ((($scope.form.data.utilidad || 0)  / 100) * $scope.form.data.precio  || 0);

        $scope.form.data.valor_utilidad = _valor_utilidad;
        $scope.form.data.valor_iva = _valor_iva;

        $scope.form.data.precio_venta = (_valor_iva + _valor_utilidad + $scope.form.data.precio);        
      }catch(e){}

    });


    $scope.$watch('iva.valor', function(n, o){
      try{
        $scope.form.data.valor_iva = ($scope.form.data.precio + $scope.form.data.valor_utilidad ) * (parseInt(n) / 100);
        $scope.form.data.precio_venta = (
                                        $scope.form.data.valor_iva + ($scope.form.data.precio) 
                                        + ($scope.form.data.valor_utilidad )
                                      )        
      }catch(e){}

    });

    $scope.$watch('form.data.utilidad', function(n, o){
      try{
        $scope.form.data.valor_utilidad = ($scope.form.data.precio * ($scope.form.data.utilidad / 100)); 
        $scope.form.data.precio_venta = (
                                $scope.form.data.valor_iva + 
                                $scope.form.data.valor_utilidad  + 
                                $scope.form.data.precio
                                );        
      }catch(e){}

    });

    $scope.editLoad = function(){

      if($scope.stocks && $scope.stocks.length > 0){
        delete $scope.stocks;
      }

      if($scope._grocery){
        delete $scope._grocery;

      }


       $scope.$watch('formEdit.data.precio', function(n, o){
        try{
          var _valor_iva = ((parseInt($scope.EditIva ? $scope.EditIva.valor  : 0  || $scope.ivaValue) / 100) * $scope.formEdit.data.precio  || 0); 
          
          var _valor_utilidad = ((($scope.formEdit.data.utilidad || 0)  / 100) * $scope.formEdit.data.precio  || 0);

          $scope.formEdit.data.valor_utilidad = _valor_utilidad;
          $scope.formEdit.data.valor_iva = _valor_iva;

          $scope.formEdit.data.precio_venta = (_valor_iva + _valor_utilidad + $scope.formEdit.data.precio);    

        }catch(e){
              console.log("error", e);
        }
      });

      $scope.$watch('EditIva.valor', function(n, o){
          try{

            if(!n && !o){
              $scope.formEdit.data.valor_iva = (($scope.formEdit.data.precio + $scope.formEdit.data.valor_utilidad) * (parseInt($scope.ivaValue) / 100));
            }else{
             $scope.formEdit.data.valor_iva = ($scope.formEdit.data.precio * (parseInt(n || 0) / 100));
            }

            //$scope.formEdit.data.valor_iva = ($scope.formEdit.data.precio * (parseInt(n) / 100));
            $scope.formEdit.data.precio_venta = (
                                            $scope.formEdit.data.valor_iva + ($scope.formEdit.data.precio) 
                                            + ($scope.formEdit.data.valor_utilidad )
                                          )        
          }catch(e){
              console.log("error", e);
          }        
      });

      $scope.$watch('formEdit.data.utilidad', function(n, o){
        try{
          $scope.formEdit.data.valor_utilidad = ($scope.formEdit.data.precio * ($scope.formEdit.data.utilidad / 100)); 
          $scope.formEdit.data.precio_venta = (
                                  $scope.formEdit.data.valor_iva + 
                                  $scope.formEdit.data.valor_utilidad  + 
                                  $scope.formEdit.data.precio
                                  );        
        }catch(e){
          console.log("error", e);
        }

      });          
    }

    $scope.create = function(){
      api.bodega().get().success(function(res){
          if(res.length == 0){
            sweetAlert("No Existen Bodegas", "Debe existir almenos una bodega", "error");
            return ;
          }else{
             window.modal = modal.show({templateUrl : 'views/productos/agregar-producto.html', size :'lg', scope: $scope, backdrop:'static'}, function($scope){
                  if($scope.formProducto.$invalid){
                       modal.incompleteForm();
                      return;
                  }

                  api.producto().post($scope.form).success(function(res){
                      if(res){
                          $scope.load();
                          $scope.$close();

                          if(storage.get('recentsColors')){
                              storage.save('recentsColors', scope.form.data.color)
                          }

                          delete $scope.form.data;
                          sweetAlert("Registro completado.", "has registrado un nuevo producto.", "success");
                      }
                  }).error(function(data, status){
                    if(status == 409){
                      sweetAlert("Referencia duplicada", "La referencia: "+ data.reference+" ya existe", "warning");
                    }
                  });
              });            
          }
      });

    }

    $scope.delete = function(){
        var _record = this.record;

        modal.removeConfirm({closeOnConfirm : true}, 
            function(isConfirm){ 
               if (isConfirm) {
                    api.producto(_record._id).delete().success(function(res){
                        if(res){
                            $scope.records.splice($scope.records.indexOf(_record), 1);
                        }
                    });
               }
           })
    }
  } ] );
