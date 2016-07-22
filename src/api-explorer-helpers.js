'use strict';

var run = function ($scope, url, apiService) {
    $scope.$emit('urlChange', url);
}

var formatXml = function (xml) {
    var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var pad = 0;
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
    var transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0
    };

    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];
        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += '\t';
        }
        if (fromTo == 'opening->closing')
            formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
        else
            formatted += padding + ln + '\n';
    }

    return formatted;
};
var showDuration = function($scope, startTime) {
    var endTime = new Date();
    var duration = (endTime.getTime() - startTime.getTime());
    $scope.duration = duration + " ms";
    $scope.progressVisibility = "hidden";
    $scope.durationVisibility = "not-hidden";
}



var showHeaders = function($scope, headers, status) {
    
   var responseObj = {};
    if (headers != null) {
        responseObj = headers();
    }
    
    responseObj["Status Code"] = status;
    var responseHeaders = JSON.stringify(responseObj, null, 4).trim();
    
    $scope.jsonViewer.getSession().setValue("");
    $scope.jsonViewer.getSession().insert(0, responseHeaders);
}


var showResults = function ($scope, results, headers, status) {
    $scope.jsonViewer.setValue("");
    showHeaders($scope, headers, status); 
    $scope.jsonViewer.getSession().insert(0, results);
}

var handleImageResponse = function ($scope, apiService, headers, status) {
    apiService.performQuery('GET_BINARY')($scope.text, "").success(function (results, status, headers, config) {
        var arr = new Uint8Array(results);

        //  Don't use fromCharCode.apply as it blows the stack with moderate size images
        var raw = "";
        for (var i = 0; i < arr.length; i++) {
            raw = raw + String.fromCharCode(arr[i]);
        }
        var b64 = btoa(raw);
        var dataURL = "data:image/jpeg;base64," + b64;

        document.getElementById("img").src = dataURL;
        $scope.showJsonViewer = false;
        $scope.showImage = true;
        showHeaders($scope, headers);

        $scope.progressbar.complete();
    });
}

var handleHtmlResponse = function ($scope, startTime, results, headers, status){
    setJsonViewerContentType("html");
    showDuration($scope, startTime);
    showResults($scope, results, headers, status);
}

var handleJsonResponse = function ($scope, startTime, results, headers, status){
    setJsonViewerContentType("json");
    results = JSON.stringify(results, null, 4);
    showDuration($scope, startTime);
    showResults($scope, results, headers, status);
}

var handleXmlResponse = function ($scope, startTime, results, headers, status) {
    setJsonViewerContentType("xml");
    results = formatXml(results);
    showDuration($scope, startTime);
    showResults($scope, results, headers, status);
}

var isImageResponse = function (headers) {
    var contentType = getContentType(headers);
    return contentType === "application/octet-stream" || contentType.substr(0, 6) === "image/";
}

var isHtmlResponse = function (headers) {

    var contentType = getContentType(headers);
    return contentType === "text/html" || contentType === "application/xhtml+xml";
}

var isXmlResponse = function (results) {
    // Don't use headers, cos xml could be of a million content types.
    return JSON.stringify(results, null, 4).indexOf("<?xml") != -1;
}

var isJsonResponse = function (headers) {
    var contentType = getContentType(headers);
    return contentType === "application/json";
}

var getContentType = function(headers) {
    var full = headers("content-type");
    var delimiterPos = full.indexOf(";");
    if (delimiterPos != -1) {
        return full.substr(0, delimiterPos);
    } else {
        return full;
    }
}



var getEntitySets = function(XML, $log){
    var entitySetArray = {};
    var entitySets = $(($.parseHTML(XML))[2]).find("EntityContainer")[0].children;
    for(var i=0; i<entitySets.length; i++){
           var EntitySet = {};
           var name = entitySets[i].attributes[0].nodeValue;
           name = name.substring(2, name.length-2);
           EntitySet.name = name;
           EntitySet.isEntitySet = true;
           EntitySet.URLS = [];
           var type = entitySets[i].attributes[1].nodeValue;
           var index = type.indexOf("graph.")
           type = type.substring(index+6, type.length-2);
           EntitySet.entityType = type;
           entitySetArray[EntitySet.name] = EntitySet;
    }
    return entitySetArray;
}



var findNameIndex = function(array){
    for(var i=0; i<array.length; i++){
        if(array[i].name === "name"){
            return i;
        }
    }
}

var findTypeIndex = function(array){
    for(var i=0; i<array.length; i++){
        if(array[i].name === "type"){
            return i;
        }
    }
}

var createEntityTypeObject = function(returnArray, DOMarray, $log){
    for(var i=0; i<DOMarray.length; i++){
           var EntityType = {};
           var name = DOMarray[i].attributes[0].nodeValue;
           name = name.substring(2, name.length-2);
           EntityType.name = name;
           EntityType.isEntitySet = false;
           EntityType.URLS = [];
           var children = DOMarray[i].children;
           for(var j=0; j<children.length; j++){
                 if(children[j].attributes.length > 0){
                     var nameIndex = findNameIndex(children[j].attributes);
                     var typeIndex = findTypeIndex(children[j].attributes);
                     var childName = children[j].attributes[nameIndex].nodeValue;
                     childName = childName.substring(2, childName.length-2);
                     var collection = children[j].attributes[typeIndex].nodeValue;
                     collection = collection.substring(2, 12);
                     var type = children[j].attributes[typeIndex].nodeValue;
                     var index = type.lastIndexOf(".")
                     type = type.substring(index+1, type.length-2);
                     if(type.charAt(type.length-1) == ")"){
                         type = type.substring(0, type.length-1);
                     }
                     var urlObject = {};
                     urlObject.isACollection = (collection === "Collection") && (index >0);
                     urlObject.name = childName;
                     urlObject.type = type;
                     EntityType.URLS.push(urlObject);
                 }
           }
        
            returnArray[EntityType.name] = EntityType;
    }    
    return returnArray;
}

var getEntityTypes = function(XML, $log){
    var entityTypesArray = {};
    var entityTypes = $(($.parseHTML(XML))[2]).find("EntityType");
    entityTypesArray = createEntityTypeObject(entityTypesArray, entityTypes, $log);
    
    var complexTypes = $(($.parseHTML(XML))[2]).find("ComplexType");
    entityTypesArray = createEntityTypeObject(entityTypesArray, complexTypes, $log);
    
    return entityTypesArray;
}

var myTrim = function(word){
      var returnWord = word;
      if(returnWord != null){
          while(returnWord.charAt(returnWord.length-1) == "/" ){
              returnWord = returnWord.replace(/\/$/, "");
          }
          return returnWord; 
      }
} 

var getEntityName = function(URL){
     var returnWord = myTrim(URL);
     if(returnWord != null){
         returnWord = returnWord.substring(returnWord.lastIndexOf("/")+1, returnWord.length);
     }
     return returnWord;
}


var getPreviousCall = function(URL, entityName){
    var index = URL.indexOf(entityName);
    return URL.substr(0, index-1);
}


var setEntity = function(entityItem, service, $log, lastCallSuccessful){
    
    $log.log("setting entity to");
    
   if(getEntityName(service.text) == service.selectedVersion){
             var entityObj = {};
             entityObj.name = service.selectedVersion;
             service.entity = entityObj; 
             return;
    }else{
       var entityName = getEntityName(service.text);
    }
    
    $log.log(entityName);
    
    var prevCallName = getEntityName(getPreviousCall(service.text, entityName));
    var twoPrevCallsName = getEntityName(getPreviousCall(getPreviousCall(service.text, entityName), prevCallName));
    if(entityName === "me" && lastCallSuccessful){
        prevCallName = "users";
    }else if(twoPrevCallsName === "me" && lastCallSuccessful){
        twoPrevCallsName = "user";
    }
    
    var entitySet = service.cache.get(service.selectedVersion + "EntitySetData")[prevCallName];
    var entityType = service.cache.get(service.selectedVersion + "EntityTypeData")[prevCallName]; 
    var twoPrevEntityType = service.cache.get(service.selectedVersion + "EntityTypeData")[twoPrevCallsName];
    var twoPrevEntitySet = service.cache.get(service.selectedVersion + "EntitySetData")[twoPrevCallsName];
    var collection = false;
    $log.log(prevCallName);
    if(twoPrevEntitySet){
        for(var i=0; i<twoPrevEntitySet.URLS.length; i++){
            if(twoPrevEntitySet.URLS[i].name == prevCallName){
                collection = twoPrevEntitySet.URLS[i].isACollection;
            }
        }
    }else if(twoPrevEntityType){
        for(var i=0; i<twoPrevEntityType.URLS.length; i++){
            if(twoPrevEntityType.URLS[i].name == prevCallName){
                collection = twoPrevEntityType.URLS[i].isACollection;
                var collectionType = twoPrevEntityType.URLS[i].type;
            }
        }
    }
    
    service.entityNameIsAnId = (((entitySet && !entityType) || (entitySet && twoPrevCallsName === service.selectedVersion))&& lastCallSuccessful && (prevCallName != "me")) || (collection && lastCallSuccessful);
    
    if(service.entityNameIsAnId){
           $log.log("entity name is an id");
           var typeName;
           if(collection){
               $log.log("is a collection");
               typeName = collectionType;
               $log.log(typeName);
           }else if(entitySet){
               typeName = entitySet.entityType; 
           }
           service.entity = service.cache.get(service.selectedVersion + "EntityTypeData")[typeName];
    }else{
              entityItem = setToSetOrType(service, entityName, prevCallName);
             if(!entityItem && entityType){
                   for(var i=0; i < entityType.URLS.length; i++){
                         if(entityType.URLS[i].name == entityName){
                             $log.log(entityType.URLS[i]);
                              entityItem = setToSetOrType(service, entityType.URLS[i].type);
                              break;
                         }
                  }
              }else if(!entityItem && entitySet){
                  for(var i=0; i < entitySet.URLS.length; i++){
                         if(entitySet.URLS[i].name == entityName){
                             $log.log(entitySet.URLS[i]);
                              entityItem = setToSetOrType(service, entitySet.URLS[i].type);
                              break;
                         }
                  }
              }
        service.entity = entityItem;
    }
}

var setToSetOrType = function(service, entityName, prevCallName){
      var isEntitySet = service.cache.get(service.selectedVersion + "EntitySetData")[entityName];
      var isEntityType = service.cache.get(service.selectedVersion + "EntityTypeData")[entityName];
      if(isEntitySet && !isEntityType){
          return isEntitySet;
      }else if(isEntityType && !isEntitySet){
          return isEntityType;
      }else if(isEntitySet && isEntityType){
           if(prevCallName === service.selectedVersion){
               return isEntitySet
           }else{
               return isEntityType;
           }
      }
    
}

var parseMetadata = function(service, $log, $scope){
    var entitySetData, entityTypeData;
    if(!service.cache.get(service.selectedVersion + "Metadata")){
         $log.log("parsing metadata");
         service.getMetadata().success(function (results){
                results = JSON.stringify(results, null, 4).trim();
                service.cache.put(service.selectedVersion + "Metadata", results);
                entitySetData = getEntitySets(results, $log);
                service.cache.put(service.selectedVersion + "EntitySetData", entitySetData);
                entityTypeData = getEntityTypes(results, $log);
                service.cache.put(service.selectedVersion + "EntityTypeData", entityTypeData);
                $log.log("metadata successfully parsed");
                if(service.entity == ""){
                    service.entity = entityTypeData["user"];
                }else{
                    service.entity = entityTypeData[getEntityName(service.text)];
                }
                
          $scope.$root.$broadcast("updateUrlOptions");
         }).error(function(err, status){
                 $log.log("metadata could not be parsed");
         });
     }else{
          $scope.$root.$broadcast("updateUrlOptions");
     }
}
