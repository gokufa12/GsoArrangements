angular.module('nodeCrud', [])
.controller('mainController', function($scope, $http) {
    
    $scope.formData = {};
    $scope.arrangerData = {};
    
    // Get all arrangers
    $http.get('/api/v1/arranger')
        .success(function(data) {
            $scope.arrangerData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Create a new arranger
    $scope.createArranger = function() {
        $http.post('/api/v1/arranger', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.arrangerData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
    

    // Delete an arranger
    $scope.deleteArranger = function(arrangerId) {
        $http.delete('/api/v1/arranger/' + arrangerId)
            .success(function(data) {
                console.log(data);
                $scope.arrangerData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
});