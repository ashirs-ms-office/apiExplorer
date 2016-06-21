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
                         expect($scope.$parent.$text).toEqual(apiService.$text);
                     }
                });
               
        });
    });
});