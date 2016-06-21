describe("ApiExplorer", function(){
    
    beforeEach(function(){
        module("ApiExplorer");
    }); 

    describe("Controller: DropdownCtrl", function(){

        var $scope, $log, ApiExplorerService;

        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc){
            $log = _$log_;
            $scope = $rootScope.$new();
            apiService = ApiExplorerSvc;
            dropdownController = $controller("DropdownCtrl", {
              $scope: $scope  
            });
        }));

       describe("When the $scope.selectedOption changes", function(){
           
           it("should update the apiService.selectedOptions", function(){

                 for(var i=0; i<$scope.items.length; i++){
                      $scope.selectedOption = $scope.items[i];
                      $scope.$digest();
                      expect(apiService.selectedOption).toEqual($scope.selectedOption);
                 }
          });
           
          it("should reset the text back to the root URL for autocomplete", function(){
                
                 expect(apiService.text).toBe("https://graph.microsoft.com/" + apiService.selectedVersion + "/");
          });
           
          it("should open the jsonEditor on POST and PATCH", function(){
              
                 $scope.selectedOption = "POST";
                 $scope.$digest();
                 expect(apiService.showJsonEditor).toBeTruthy();
              
                 $scope.selectedOption = "GET";
                 $scope.$digest();
                 expect(apiService.showJsonEditor).toBeFalsy(); 
              
                 $scope.selectedOption = "PATCH";
                 $scope.$digest();
                 expect(apiService.showJsonEditor).toBeTruthy();
              
                 $scope.selectedOption = "DELETE";
                 $scope.$digest();
                 expect(apiService.showJsonEditor).toBeFalsy();
          });
       });
    });
    
    describe("Controller: VersionCtrl", function(){
        
        var $scope, $log, ApiExplorerService;

        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc){
            $log = _$log_;
            $scope = $rootScope.$new();
            apiService = ApiExplorerSvc;
            versionController = $controller("VersionCtrl", {
              $scope: $scope  
            });
        }));
        
       
        describe("When the $scope.selectedVersion changes", function(){
            
                it("should update the apiService.selectedVersion", function(){
                    
                     for(var i=0; i<$scope.items.length; i++){
                         $scope.selectedVersion = $scope.items[i];
                         $scope.$digest();
                         expect(apiService.selectedVersion).toEqual($scope.selectedVersion);
                     }
                });
            
                it("should change the service and scope text to reflect the updated version", function(){
                     for(var i=0; i<$scope.items.length; i++){
                         $scope.selectedOption = $scope.items[i];
                         expect(apiService.text).toEqual("https://graph.microsoft.com/" + apiService.selectedVersion + "/");
                         expect($scope.$parent.$text).toEqual(apiService.text);
                     }
                });
               
        });
    });
    
    describe("Controller: DatalistCtrl", function(){
        
        var $scope, $log, ApiExplorerService;
        
        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc){
            $log = _$log_;
            $scope = $rootScope.$new();
            service = ApiExplorerSvc;
            datalistController = $controller("datalistCtrl", {
              $scope: $scope  
            });
            
        }));
        
        
        describe("When the apiService.entity changes", function(){
            describe("to the topLevel", function(){
               
              it("should update the urlOptions to the entitySetData", function(){
                   service.entity = "topLevel";
                   $scope.$digest();
                   expect($scope.urlOptions).toEqual(service.cache.get(service.selectedVersion + "EntitySetData"));
              });
                
              it("should push the options to the urlArray", function(){
                  service.entity = "topLevel";
                  $scope.$digest();
                  var i = 0;
                  for(var x in $scope.urlOptions){
                      expect($scope.urlArray[i]).toEqual($scope.urlOptions[x]);
                      i++;
                  }
              });
                
            });
            
            
            describe("to an entity not at the topLevel", function(){
                 it("should update the urlOptions", function(){
                        var entityOptions = apiService.cache.get(apiService.selectedVersion + "EntityTypeData");
                        for(var entityOption in entityOptions){
                            apiService.entity = entityOption;
                            $scope.$digest();
                            expect($scope.urlOptions).toEqual(apiService.entity.URLS);
                        }
                 });

                it("should push the options to the urlArray", function(){
                    var entityOptions = service.cache.get(service.selectedVersion + "EntityTypeData");
                    for(var entityOption in entityOptions){
                        service.entity = entityOption;
                        $scope.$digest();
                        var i = 0;
                        for(var x in $scope.urlOptions){
                          expect($scope.urlArray[i]).toEqual($scope.urlOptions[x]);
                          i++;
                       }
                    }
                });
                
            });
            
        });
        
        describe("When the searchTextChanges", function(){
            it("Should add a trailing / to the text if there isn't already one there", function(){
               service.text = "test";
               $scope.searchTextChange("searchText");
               expect(service.text).toEqual("test/");
               $scope.searchTextChange("searchText");
               expect(service.text).toEqual("test/");
            });
                
        })
        
        describe("When the autocomplete control calls getMatches()", function(){
              it("should set the parent text to the apiService text", function(){
                  expect($scope.$parent.text).toEqual(service.text);
              });
            
            
            describe("When the selectedOption is GET", function(){
                 describe("and the queryIsEmpty", function(){
                       it("should return all urlOptions", function(){
                           expect($scope.getMatches("")).toEqual($scope.urlArray);
                       });
                 });

                 describe("and the queryIsEntityName", function(){
                     it("should return all urlOptions", function(){
                         expect($scope.getMatches("URL/" + service.entity.name)).toEqual($scope.urlArray);
                     });
                 });

                 describe("and the query is an id", function(){
                     describe("and the queryIsEntityName", function(){
                         it("should return all urlOptions", function(){
                             service.isAnId = true;
                             expect($scope.getMatches("URL/" + service.entity.name + "/id123456789")).toEqual($scope.urlArray);    
                         });
                     });
                 });
            });
            
            describe("When the selectedOption is not GET", function(){
                it("should return an array with just the topLevel URL text", function(){
                   service.selectedOption = "POST";
                   expect($scope.getMatches("query")).toEqual([service.text]);
                   service.selectedOption = "DELETE";
                   expect($scope.getMatches("query")).toEqual([service.text]);
                   service.selectedOption = "PATCH";
                   expect($scope.getMatches("query")).toEqual([service.text]);
                });
            });
        });
    });
});