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
var showDuration = function($scope, startTime, $mdToast) {
    var endTime = new Date();
    var duration = (endTime.getTime() - startTime.getTime());
    $scope.duration = duration + " ms";
    $mdToast.show(
        $mdToast.simple().
        textContent($scope.duration).
        hideDelay(3000).
        position('bottom right')
    );
    $scope.progressVisibility = "hidden";

    //$scope.progressbar.complete();
}



var showHeaders = function($scope, headers) {
    if (headers != null) {
        $scope.responseHeaders = JSON.stringify(headers(), null, 4).trim();
    }
}

var showResults = function ($scope, results, headers) {
    $scope.jsonViewer.setValue("");

    showHeaders($scope, headers); 
    
    $scope.jsonViewer.getSession().insert(0, results);
}

var handleImageResponse = function ($scope, apiService, headers) {
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

var handleHtmlResponse = function ($scope, startTime, results, headers, $mdToast) {
    setJsonViewerContentType("html");
    showDuration($scope, startTime, $mdToast);
    showResults($scope, results, headers);
}

var handleJsonResponse = function ($scope, startTime, results, headers, $mdToast) {
    setJsonViewerContentType("json");
    results = JSON.stringify(results, null, 4);
    showDuration($scope, startTime, $mdToast);
    showResults($scope, results, headers);
}

var handleXmlResponse = function ($scope, startTime, results, headers, $mdToast) {
    setJsonViewerContentType("xml");
    results = formatXml(results);
    showDuration($scope, startTime, $mdToast);
    showResults($scope, results, headers);
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
           //entitySetArray.push(EntitySet);
    }
    return entitySetArray;
}



var getEntityTypes = function(XML, $log){
    var entityTypesArray = {};
    var entityTypes = $(($.parseHTML(XML))[2]).find("EntityType");
    for(var i=0; i<entityTypes.length; i++){
           var EntityType = {};
           var name = entityTypes[i].attributes[0].nodeValue;
           name = name.substring(2, name.length-2);
           EntityType.name = name;
           EntityType.isEntitySet = false;
           EntityType.URLS = [];
           var children = entityTypes[i].children;
           for(var j=0; j<children.length; j++){
                 if(children[j].attributes.length > 0){
                     var childName = children[j].attributes[0].nodeValue;
                     childName = childName.substring(2, childName.length-2);
                     var urlObject = {};
                     urlObject.name = childName;
                     EntityType.URLS.push(urlObject);
                 }
           }
        
            entityTypesArray[EntityType.name] = EntityType;
    }
    return entityTypesArray;
}

/*var dynamicallyPopulateURLsForEntitySets = function(service, jsonObj){
    if(service.entity != null && service.entity.isEntitySet){
        service.entity.URLS = [];
        for(var i=0; i<jsonObj.value.length && i<10; i++){
            var urlObject = {};
            urlObject.name = jsonObj.value[i].id;
            service.entity.URLS.push(urlObject);
        }
    }
}*/
    
var myTrim = function(word){
      var returnWord = word;
      if(returnWord != null){
          while(returnWord.charAt(returnWord.length-1) == "/"){
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


var setEntity = function(entityItem, service, $log){
    
    if(service.selectedOption != "GET"){
        return;
    }
    
    $log.log("setting entity to");
    $log.log(entityItem);
    
    if(!entityItem){
         if(getEntityName(service.text) == service.selectedVersion){
             service.entity = "topLevel";
             return;
         }else{
             var entityName = getEntityName(service.text);
             $log.log(entityName);
         }
    }else{
       var entityName = entityItem.name; 
    }
    
    service.entityNameIsAnId = service.cache.get(service.selectedVersion + "EntitySetData")[getEntityName(getPreviousCall(service.text, entityName))];
    
    if(service.entityNameIsAnId){
           $log.log("entity name is an id")
           var typeName = service.entityNameIsAnId.entityType; 
           service.entity = service.cache.get(service.selectedVersion + "EntityTypeData")[typeName];
          // service.entity = "id";
    }else{
        if(!entityItem){
              var isEntitySet = service.cache.get(service.selectedVersion + "EntitySetData")[entityName];
              var isEntityType = service.cache.get(service.selectedVersion + "EntityTypeData")[entityName];
              if(isEntitySet){
                  entityItem = isEntitySet;
              }else if(isEntityType){
                  entityItem = isEntityType;
              }
        }
        service.entity = entityItem;
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
                   service.entity = "topLevel";
                }
          $scope.$root.$broadcast("updateUrlOptions");
         }).error(function(err, status){
                 $log.log("metadata could not be parsed");
         });
     }else{
          $scope.$root.$broadcast("updateUrlOptions");
     }
}

var replaceEntityWithEllipses = function(val){
    
    return "REPLACED";
}
    