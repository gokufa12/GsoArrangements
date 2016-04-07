angular.module('nodeCrud', ["trNgGrid"])
.run(function () {
    TrNgGrid.defaultColumnOptions.displayAlign="center";
    TrNgGrid.defaultPagerMinifiedPageCountThreshold = 3;
})
.controller('userController', function($scope, $http) {
    
    $scope.formData = {};
    $scope.orchestraData = {};
    $scope.userData = {};
    
    // Get all users
    $http.get('/api/v1/user')
        .success(function(data) {
            $scope.userData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    $http.get('/api/v1/orchestra')
        .success(function(data) {
            $scope.orchestraData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Create a new user
    $scope.createUser = function() {
        $http.post('/api/v1/user', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.userData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
    

    // Delete an user
    $scope.deleteUser = function(userId) {
        $http.delete('/api/v1/user/' + userId)
            .success(function(data) {
                console.log(data);
                $scope.userData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
})
.controller('userProfileController', function($scope, $http) {
    
    $scope.userData = {};
    $scope.arrangementData = {};
    $scope.selectedSong = [{song_id:0}];
    $scope.selectedUser = [{user_id:0}];
    //$scope.reviewData = {};
    
    //$scope.$watchCollection(function() {return $scope.selectedSong;}, function(newSong,oldSong) {
    //    console.log('selectedSong changed: ');
    //    $http.get('/api/v1/song/' + $scope.selectedSong[0].song_id + '/review/')
    //        .success(function(data) {
    //            console.log('got the reviews');
    //            $scope.reviewData = data;
    //            console.log(data);
    //        })
    //        .error(function(error) {
    //            console.log('Error: ' + error);
    //        });
    //});
    
    // Get user's info
    $http.get('/api/v1/user/')
        .success(function(data) {
            console.log('got the users');
            $scope.userData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Get user's arrangements
    $scope.$watchCollection(function() {return $scope.selectedUser;}, function(newUser,oldUser) {
        url = '/api/v1/song/';
        if ($scope.selectedUser[0] != null && $scope.selectedUser[0].user_id !== 0) {
            url = '/api/v1/user/' + $scope.selectedUser[0].user_id + '/song';
        }
        console.log('Using url: ' + url);
        $http.get(url)
            .success(function(data) {
                console.log('got the arrangement data');
                $scope.arrangementData = data;
                console.log(data);
            })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    });
    
})
.controller('songController', function($scope, $http) {
    
    $scope.formData = {};
    $scope.songData = {};
    $scope.userData = {};
    
    // Get all users
    $http.get('/api/v1/user')
        .success(function(data) {
            $scope.userData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Get all songs
    $http.get('/api/v1/song')
        .success(function(data) {
            $scope.songData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
    // Create a new song
    $scope.createSong = function() {
        //$http.post('/api/v1/game', $scope.formData.game_title)
        //    .success(function(data) {
        //        console.log(data);
        //    })
        //    .error(function(error) {
        //        console.log('Error: ' + error);
        //    });
            
        $http.post('/api/v1/song', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.songData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
});