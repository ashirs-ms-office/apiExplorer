function initializeJsonEditor($scope, content) {
    jsonEditor = ace.edit("jsonEditor");
    jsonEditor.getSession().setMode("ace/mode/javascript");
    jsonEditor.setShowPrintMargin(false);
    //accessibility - keyboard dependant users must be able to "tab out" of session
    jsonEditor.commands.bindKey("Tab", null);
    $scope.jsonEditor = jsonEditor;
    if(content){
       jsonEditor.getSession().insert(0, content);
    }
}

function initializeJsonEditorHeaders($scope) {
     
    $(document).ready(function() {
        var jsonViewerElement = document.getElementById("jsonEditorHeaders");
        jsonEditorHeaders = ace.edit("jsonEditorHeaders");
        jsonEditorHeaders.getSession().setMode("ace/mode/javascript");
        jsonEditorHeaders.setShowPrintMargin(false);
        //accessibility - keyboard dependant users must be able to "tab out" of session
        jsonEditorHeaders.commands.bindKey("Tab", null);
        $scope.jsonEditorHeaders = jsonEditorHeaders;
    });
}