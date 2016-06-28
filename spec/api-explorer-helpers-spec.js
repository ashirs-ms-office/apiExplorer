describe("ApiExplorerHelpers", function(){
    
  describe("getPreviousCall", function(){
        it("should get the call before the most recent one", function(){
              expect(getPreviousCall("http://graph.microsoft.com/v1.0/users/TEST", "TEST")).toEqual("http://graph.microsoft.com/v1.0/users");
        });
  });
    
    
   describe("getEntityName", function(){
        it("should get the last call", function(){
            expect(getEntityName("http://graph.microsoft.com/v1.0/users/TEST/" )).toEqual("TEST");
            
            expect(getEntityName("http://graph.microsoft.com/v1.0/users/TEST" )).toEqual("TEST");
        });
       
    
    });
    
   describe("myTrim", function(){
        it("should remove any / at the end of a string", function(){
              expect(myTrim("http://graph.microsoft.com/v1.0/users/TEST")).toEqual("http://graph.microsoft.com/v1.0/users/TEST");
            
              expect(myTrim("http://graph.microsoft.com/v1.0/users/TEST/")).toEqual("http://graph.microsoft.com/v1.0/users/TEST");
            
              expect(myTrim("http://graph.microsoft.com/v1.0/users/TEST//")).toEqual("http://graph.microsoft.com/v1.0/users/TEST");
        });
    });
    
});