function initializeJsonEditor($scope) {
    jsonEditor = ace.edit("jsonEditor");
    jsonEditor.getSession().setMode("ace/mode/javascript");
    jsonEditor.setShowPrintMargin(false);
    $scope.jsonEditor = jsonEditor;
}