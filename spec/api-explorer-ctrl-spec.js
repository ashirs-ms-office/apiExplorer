describe("DropdownCtrl", function(){
    beforeEach(angular.mock.module('ApiExplorer'));
    var $controller;
    
    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));
    
    describe("$scope.OnItemClick", function(){
        
           var $scope, controller;

            beforeEach(function() {
              $scope = {};
              controller = $controller('DropdownCtrl', { $scope: $scope });
            });
        
          it('sets the parent selectedOption to the input', function() {
              
              $scope.OnItemClick("GET");
              expect($scope.$parent.selectedOptions).toEqual("GET");
        
              $scope.OnItemClick("POST");
              expect($scope.$parent.selectedOptions).toEqual("POST");
              
              $scope.OnItemClick("PATCH");
              expect($scope.$parent.selectedOptions).toEqual("PATCH");
              
              $scope.OnItemClick("DELETE");
             expect($scope.$parent.selectedOptions).toEqual("DELETE");
          });
        
        it('shows the JSON editor when POST or PATCH is the selected option', function() {
           $scope.OnItemClick("GET");
           expect($scope.$parent.showJsonEditor).toBe(false);
            
           $scope.OnItemClick("POST");
           expect($scope.$parent.showJsonEditor).toBe(true);
            
           $scope.OnItemClick("PATCH");
           expect($scope.$parent.showJsonEditor).toBe(true);
            
           $scope.OnItemClick("DELETE");
           expect($scope.$parent.showJsonEditor).toBe(false);
           
        });
    });

});

describe("VersionCtrl", function(){
    beforeEach(angular.mock.module('ApiExplorer'));
    var $controller;
    
    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));
    
    describe("$scope.OnItemClick", function(){
        
           var $scope, controller;

            beforeEach(function() {
              $scope = {};
              controller = $controller('VersionCtrl', { $scope: $scope });
            });
        
          it('sets the parent selectedVersion to the input', function() {
              
              $scope.OnItemClick("beta");
              expect($scope.$parent.selectedVersion).toEqual("beta");
        
              $scope.OnItemClick("v1.0");
              expect($scope.$parent.selectedOptions).toEqual("v1.0");

          });
        
    });

});

describe("datalistCtrl", function(){
    beforeEach(angular.mock.module('ApiExplorer'));
    var $controller;
    
    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));
    
    describe("$scope.$parent.$on('clearUrls)", function(){
        
           var $scope, controller;

            beforeEach(function() {
              $scope = {};
              controller = $controller('datalistCtrl', { $scope: $scope });
            });
        
          it('sets the urlOptions array to empty', function() {
              
              $scope.$emit("clearUrls");
              expect($scope.urlOptions).toEqual([]);

          });
        
    });

});