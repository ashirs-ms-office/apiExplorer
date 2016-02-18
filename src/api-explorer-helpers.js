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
    $scope.$parent.showDuration = true;
    $scope.progressbar.complete();
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

var handleHtmlResponse = function ($scope, startTime, results, headers) {
    setJsonViewerContentType("html");
    showDuration($scope, startTime);
    showResults($scope, results, headers);
}

var handleJsonResponse = function ($scope, startTime, results, headers) {
    setJsonViewerContentType("json");
    results = JSON.stringify(results, null, 4).trim();
    showDuration($scope, startTime);
    showResults($scope, results, headers);
}

var handleXmlResponse = function ($scope, startTime, results, headers) {
    setJsonViewerContentType("xml");
    results = formatXml(results);
    showDuration($scope, startTime);
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
