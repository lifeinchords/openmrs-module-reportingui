window.adHocAnalysis = {
    queryPromises: {},
    queryResults: {},

    fetchData: function($http, target, type) {
        var promise = $http.get(emr.fragmentActionLink('reportingui', 'definitionLibrary', 'getDefinitions', { type: type })).
            success(function(data, status, headers, config) {
                _.each(data, function(item) {
                    item.label = item.name + ' (' + item.description + ')';
                });
                target.queryResults[type] = data;
            });
        target.queryPromises[type] = promise;
    }
}

var app = angular.module('adHocAnalysis', [ ]).

    run(function($http) {
        window.adHocAnalysis.fetchData($http, window.adHocAnalysis, 'org.openmrs.module.reporting.cohort.definition.CohortDefinition');
        window.adHocAnalysis.fetchData($http, window.adHocAnalysis, 'org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition');
    }).

    directive('definitionsearch', function($compile) {
        // expect { type: ..., key: ..., name: ..., description: ..., parameters: [ ... ] }

        return function(scope, element, attrs) {
            var onSelectAction = scope[attrs['action']];
            element.autocomplete({
                source: [ 'Loading...' ],
                select: function(event, ui) {
                    scope.$apply(function() {
                        onSelectAction(ui.item);
                    });
                    element.val('');
                    return false;
                },
                change: function(event, ui) {
                    element.val('');
                    return false;
                }
            });
            var definitionType = attrs['definitionType'];
            window.adHocAnalysis.queryPromises[definitionType].success(function() {
                element.autocomplete( "option", "source", window.adHocAnalysis.queryResults[definitionType] );
            });
        };
    }).

    controller('AdHocAnalysisController', ['$scope', '$http', function($scope, $http) {

        $scope.rowQueries = [];

        $scope.columns = [];

        $scope.results = null;

        var swap = function(array, idx1, idx2) {
            if (idx1 < 0 || idx2 < 0 || idx1 >= array.length || idx2 >= array.length) {
                return;
            }
            var temp = array[idx1];
            array[idx1] = array[idx2];
            array[idx2] = temp;
        }

        $scope.addRow = function(definition) {
            $scope.rowQueries.push(definition);
        }

        $scope.removeRow = function(idx) {
            $scope.rowQueries.splice(idx, 1);
        }

        $scope.addColumn = function(definition) {
            $scope.columns.push(definition);
        }

        $scope.removeColumn = function(idx) {
            $scope.columns.splice(idx, 1);
        }

        $scope.moveColumnUp = function(idx) {
            swap($scope.columns, idx - 1, idx);
        }

        $scope.moveColumnDown = function(idx) {
            swap($scope.columns, idx, idx + 1);
        }

        $scope.preview = function() {
            $scope.results = null;

            $http.get(emr.fragmentActionLink('reportingui', 'adHocAnalysis', 'preview',
                    {
                        rowQueries: angular.toJson($scope.rowQueries),
                        columns: angular.toJson($scope.columns)
                    })).
                success(function(data, status, headers, config) {
                    $scope.results = data;
                });
        }

    }]);