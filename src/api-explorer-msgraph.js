var msGraphLinkResolution = function ($scope, body, args) {
    if (args.indexOf("https://") == -1) {
        if ($scope.text.indexOf(args.substr(1)) != -1) {

        } else if ($scope.text.indexOf("/me") != -1 && $scope.text.indexOf("/me/") == -1 && $scope.text.indexOf("/memberOf") == -1) {
            $scope.text = $scope.text.replace("/me", "") + "/users/" + args.substr(1);
        } else {

            // if type exists
            var index = body.indexOf(args.substr(1));
            var typeIndex = body.lastIndexOf('@odata.type', index);
            if (typeIndex != -1) {
                var typeIndexEnd = body.indexOf("\n", typeIndex);
                var type = body.substr(typeIndex, typeIndexEnd - typeIndex);
                type = type.replace("@odata.type\": \"#microsoft.graph.", "");
                type = type.replace("\"", "").replace(",", "");
                $scope.text = "https://graph.microsoft.com/v1.0/" + type + "s/" + args.substr(1);
            } else {
                if ($scope.text.indexOf("?") != -1) {
                    $scope.text = $scope.text.substr(0, $scope.text.indexOf("?"));
                }
                $scope.text = $scope.text + "/" + args.substr(1);
            }
        }
    } else {
        $scope.text = args.replace("\"", "");
    }
    $scope.selectedOptions = 'GET';
    $scope.submit();
}