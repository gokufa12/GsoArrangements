angular.module('nodeCrud', [])
.controller('arrangerController', function($scope, $http) {
    
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
})
.controller('reviewerController', function($scope, $http) {
    
    $scope.formData = {};
    $scope.reviewerData = {};
    $scope.instrumentData = {};
    
    // Get all arrangers
    $http.get('/api/v1/reviewer')
        .success(function(data) {
            $scope.reviewerData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Get all arrangers
    $http.get('/api/v1/instrument')
        .success(function(data) {
            $scope.instrumentData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Create a new reviewer
    $scope.createReviewer = function() {
        $http.post('/api/v1/reviewer', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.reviewerData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
    

    // Delete a reviewer
    $scope.deleteReviewer = function(reviewerId) {
        $http.delete('/api/v1/reviewer/' + reviewerId)
            .success(function(data) {
                console.log(data);
                $scope.reviewerData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
});