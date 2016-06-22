describe("ApiExplorer", function(){
    
    beforeEach(function(){
        module("ApiExplorer");
    }); 

    
    describe("Controller: ApiExplorerCtrl", function(){
        var  $scope, $log, ApiExplorerService;
        
        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc){
            $log = _$log_;
            $scope = $rootScope.$new();
            apiService = ApiExplorerSvc;
            dropdownController = $controller("DropdownCtrl", {
              $scope: $scope  
            });
        }));
        
        describe("when the service.showJsonEditor value changes", function(){
              it("should initialize the editor when the bool is true", function(){
                   spyOn(window, "initializeJsonEditor");
                   apiService.showJsonEditor = true;
                   $scope.$apply();
                   expect(initializeJsonEditor).toHaveBeenCalled();
              });
        });
        
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
                         console.log("old: " + apiService.selectedVersion);
                         console.log("new: " + $scope.items[i]);
                         $scope.selectedVersion = $scope.items[i];
                         $scope.$digest();
                         expect(apiService.selectedVersion).toEqual($scope.selectedVersion);
                     }
                });
            
                it("should change the service text to reflect the updated version", function(){
                     for(var i=0; i<$scope.items.length; i++){
                         $scope.selectedOption = $scope.items[i];
                         expect(apiService.text).toEqual("https://graph.microsoft.com/" + apiService.selectedVersion + "/");
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
    
    describe("Controller: FormCtrl", function(){
        var $scope, $log, ApiExplorerService;
        var historyObjs = [];
        
        beforeEach(inject(function ($rootScope, $controller, _$log_, ApiExplorerSvc, $httpBackend){
            $log = _$log_;
            $scope = $rootScope.$new();
            apiService = ApiExplorerSvc;
            formControl = $controller("FormCtrl", {
              $scope: $scope  
            });
        }));
        
        describe("when a history object is clicked", function(){
            beforeEach(function(){
                $scope.userInfo.isAuthenticated = true;
                spyOn($scope, "submit");
                var mockHistoryObjGet = {
                     urlText: "previousString/",
                     selectedVersion: "beta",
                     htmlOption: "GET",
                     jsonInput: "",
                     success: "success"
                 };

                historyObjs.push(mockHistoryObjGet);

                 var mockHistoryObjPost = {
                    urlText: "previousString/",
                    selectedVersion: "beta",
                    htmlOption: "POST",
                    jsonInput: "postingContent",
                    success: "error"
                 };


                historyObjs.push(mockHistoryObjPost);

                 var mockHistoryObjPatch = {
                     urlText: "previousString/",
                     selectedVersion: "v1.0",
                     htmlOption: "PATCH",
                     jsonInput: "content",
                     success: "success"
                 };


                historyObjs.push(mockHistoryObjPatch);

                 var mockHistoryObjDelete = {
                     urlText: "previousString/",
                     selectedVersion: "v1.0",
                     htmlOption: "DELETE",
                     jsonInput: "",
                     success: "error"
                 };
             
             
                historyObjs.push(mockHistoryObjDelete);
            });
            
            
           it("should set the $scope.text equal to the history URL", function(){
                 for(var i=0; i<historyObjs.length; i++){
                     $scope.historyOnClick(historyObjs[i]);
                     expect($scope.text).toEqual(historyObjs[i].urlText);
                 }
           });
            
           it("should set the apiService.selectedVersion to the history selectedVersion", function(){
               
                 for(var i=0; i<historyObjs.length; i++){
                   
                   $scope.historyOnClick(historyObjs[i]);      expect(apiService.selectedVersion).toEqual(historyObjs[i].selectedVersion);
                }
           });
            
            
           it("should set the apiService.selectedOption to the history html Option", function(){
                for(var i=0; i<historyObjs.length; i++){
                    $scope.historyOnClick(historyObjs[i]);
                    expect(apiService.selectedOption).toEqual(historyObjs[i].htmlOption);
                }
           });
            
            it("should show the JSON editor if the htmlOption is post or patch", function(){
                for(var i=0; i<historyObjs.length; i++){
                    $scope.historyOnClick(historyObjs[i]);
                    if(historyObjs[i].htmlOption == 'POST' || historyObjs[i].htmlOption == 'PATCH'){
                        expect(apiService.showJsonEditor).toBeTruthy();
                    }else if(historyObjs[i].htmlOption == 'GET' || historyObjs[i].htmlOption == 'DELETE'){
                        expect(apiService.showJsonEditor).toBeFalsy();
                    }
                }
            });
            
        });
        
        describe("when the selected item is changed", function(){
              it("should set the entityItem to that item", function(){
                     $scope.selectedItemChange("test");
                     expect($scope.entityItem).toEqual("test");
              });
        });
        
        describe("when submit is called", function(){
            
                beforeEach(function(){
                    $scope.userInfo.isAuthenticated = true;
                });
            
                it("should set scope.text and service.text to equal the query + /", function(){
                    
                     setEntity = jasmine.createSpy();

                     $scope.submit("query");
                     expect($scope.text).toEqual("query/");
                     expect(apiService.text).toEqual("query/");

                     $scope.submit("query/");
                     expect($scope.text).toEqual("query/");
                     expect(apiService.text).toEqual("query/");
                });
            
                it("should create a history object and add it to the array when the query is not null", function(){
                      var historyLength = $scope.history.length;
                      $scope.submit("query");
                      expect(historyLength+1).toBe($scope.history.length);

                      $scope.submit(null)
                      expect(historyLength+1).toBe($scope.history.length);
                 });
                    
                 it("should have all of the properties of the current submission", function(){
                      
                        $scope.submit("query");
                        var recentHistoryObj = $scope.history[0];
                        expect(recentHistoryObj.urlText).toEqual(apiService.text);
                        expect(recentHistoryObj.selectedVersion).toEqual(apiService.selectedVersion);
                        expect(recentHistoryObj.htmlOption).toEqual(apiService.selectedOption);
                      
                        if(recentHistoryObj.htmlOption == "POST" || recentHistoryObj.historyOption == "PATCH"){
                             expect(recentHistoryObj.jsonInput).toEqual($scope.jsonEditor.getSession().getValue());
                        }else{
                            expect(recentHistoryObj.jsonInput).toEqual("");
                        }
                      
                  });
            
            
                it("should perform the query", function(){
                    
                    
                    /*$httpBackend.when('GET'
                    , "validQuery").respond({foo: 'bar'})
                    spyOn(apiService, "performQuery").and.callThrough();
                    parseMetadata = jasmine.createSpy();
                    $scope.submit("validQuery"); 
                    expect(apiService.performQuery).toHaveBeenCalledWith(apiService.selectedOption);
                    
                    handleImageResponseSpy = jasmine.createSpy("handleImageResponse");
                    handleImageResponseSpy.and.callThrough();
                    handleHtmlResponseSpy = jasmine.createSpy("handleHtmlResponse");
                    handleHtmlResponseSpy.and.callThrough(); 
                    handleXmlResponseSpy = jasmine.createSpy("handleXmlResponse");
                    handleXmlResponseSpy.and.callThrough();
                    handleJsonResponseSpy = jasmine.createSpy("handleJsonResponse")
                    handleJsonResponseSpy.and.callThrough();
                    
                    if(isImageResponse(headers)){
                        expect(handleImageResponseSpy).toHaveBeenCalled();
                    }*/
                });
        });
    });
});