describe("ApiExplorer", function(){
    
    beforeEach(function(){
       module("ApiExplorer");
    }); 

    describe("Controller: DropdownCtrl", function(){

        var scope, $log, ApiExplorerService;


        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc){
            $log = _$log_;
            scope = $rootScope.$new();
            dropdownController = $controller("DropdownCtrl", {
              $scope: scope  
            });
        }));

      it("should be true", function(){
         expect(true).toBeTruthy();
      });
    });
});