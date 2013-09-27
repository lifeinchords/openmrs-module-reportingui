var runReportApp = angular.module("runReportApp", [ ]).
    filter('translate', function() {
        return function(input, prefix) {
            var code = prefix ? prefix + input : input;
            return emr.message(code, input);
        }
    });

runReportApp.controller('RunReportController', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout) {

    $scope.queue = [];

    $scope.completed = [];

    $scope.refreshHistory = function() {
        $http.get("reportStatus/getQueuedRequests.action?reportDefinition=" + $window.reportDefinition.uuid).
            success(function(data, status, headers, config) {
                $scope.queue = data;
                if ($scope.queue.length > 0) {
                    $timeout($scope.refreshHistory, 10000);
                }
            }).
            error(function(data, status, headers, config) {
                console.log("Error getting queue: " + status);
                $scope.queue = [];
            });

        $http.get("reportStatus/getCompletedRequests.action?reportDefinition=" + $window.reportDefinition.uuid).
            success(function(data, status, headers, config) {
                $scope.completed = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error getting completed: " + status);
                $scope.completed = [];
            });
    }

    var defaultSuccessAction = function(data, status, headers, config) {
        emr.successMessage(data.message);
        $scope.refreshHistory();
    }

    var defaultErrorAction = function(data, status, headers, config) {
        emr.errorMessage(data.message);
        $scope.refreshHistory();
    }

    $scope.cancelRequest = function(request) {
        $http.post("reportStatus/cancelRequest.action?reportRequest=" + request.uuid).
            success(defaultSuccessAction).
            error(defaultErrorAction);
    }

    $scope.canSave = function(request) {
        return request.status == 'COMPLETED';
    }

    $scope.saveRequest = function(request) {
        $http.post("reportStatus/saveRequest.action?reportRequest=" + request.uuid).
            success(defaultSuccessAction).
            error(defaultErrorAction);
    }

}]);