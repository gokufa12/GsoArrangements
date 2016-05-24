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
.controller('loginController', function($scope, $http, $window) {
    
    $scope.formData = {};

    // Sign In
    $scope.signIn = function() {
        $http.post('/api/v1/authenticate', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                console.log(data);
                $window.location.assign('/users/');
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
})
.controller('signupController', function($scope, $http) {
    
    $scope.formData = {};

    // Sign In
    $scope.signUp = function() {
        $http.post('/api/v1/signup', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
})
.controller('browseArrangementsController', function($scope, $http) {
    
    $scope.userData = {};
    $scope.arrangementData = {};
    $scope.selectedSong = [{song_id:0}];
    $scope.selectedUser = [{user_id:0}];
    
    //Leaving in review code for future release
    //$scope.reviewData = {};
    //
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
.controller('userProfileController', function($scope, $http) {
    
    $scope.userData = {};
    $scope.arrangementData = {};
    $scope.selectedSong = [{song_id:0}];
    
    // Get user's info
    $http.get('/api/v1/user/id')
        .success(function(data) {
            console.log('got the user');
            $scope.userData = data;
             if ($scope.userData[0] != null && $scope.userData[0].user_id !== 0) {
                url = '/api/v1/user/' + $scope.userData[0].user_id + '/song';
           
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
            }
            console.log($scope.userData);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        
})
.controller('addSongController', function($scope, $http) {
    
    $scope.formData = {};
    $scope.arrangementData = {};
        
    // Get users songs
    function getSongs() {
        $http.get('/api/v1/user/song/id')
            .success(function(data) {
                $scope.arrangementData = data;
                console.log("successfully got songs");
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    }
    getSongs();
        
    // Create a new song
    $scope.createSong = function() {
        //add game data in future release
        //$http.post('/api/v1/game', $scope.formData.game_title)
        //    .success(function(data) {
        //        console.log(data);
        //    })
        //    .error(function(error) {
        //        console.log('Error: ' + error);
        //    });
            
        $http.post('/api/v1/song/id', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                console.log("successful");
                $http.get('/api/v1/user/song/id')
                .success(function(data) {
                    $scope.arrangementData = data;
                    console.log("successfully got songs");
                })
                .error(function(error) {
                    console.log('Error: ' + error);
                });
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });    
    };
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
        //Add in game data in future release
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

//use the navbar template
angular.module("navbarapp", ["controllers"])
  .directive("bootstrapNavbar", function() {
  return {
    restrict: "E",         
    replace: true,         
    transclude: true,      
    templateUrl: "navbar.html"    
  }});