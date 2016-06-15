function initializeJsonEditor($scope) {
    jsonEditor = ace.edit("jsonEditor");
    jsonEditor.getSession().setMode("ace/mode/javascript");
    jsonEditor.setShowPrintMargin(false);
    //accessibility - keyboard dependant users must be able to "tab out" of session
    jsonEditor.commands.bindKey("Tab", null);
    $scope.jsonEditor = jsonEditor;
}