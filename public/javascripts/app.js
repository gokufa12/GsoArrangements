angular.module('nodeCrud', ['trNgGrid', 'navbarapp'])
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

 angular.module('fileupload', ['ngFileUpload'])
    .controller('MyCtrl',['Upload','$window',function(Upload,$window){
        var vm = this;
        vm.submit = function(){ //function to call on form submit
            if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                vm.upload(vm.file); //call upload function
            }
        }
        
        vm.upload = function (file) {
            console.log(file);
            Upload.upload({
                url: 'http://localhost:3000/api/v1/song/csv', //webAPI exposed to upload the file
                data:{file:file} //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
                if(resp.status === 200){ //validate success
                    $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                } else {
                    $window.alert('an error occured');
                }
            }, function (resp) { //catch error
                console.log('Error status: ' + resp.status);
                $window.alert('Error status: ' + resp.status);
            }, function (evt) { 
                console.log(evt);
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
            });
        };
    }]);

//use the navbar template
angular.module('navbarapp', [])
  .directive("navbar", function() {
  return {
    restrict: "AE",         
    replace: true,         
    transclude: false,      
    template:   '<nav class="navbar navbar-inverse">' +
                    '<div class="container-fluid">' +
                        '<div class="navbar-header">' +
                        '<a class="navbar-brand" href="./">GSO Arrangements</a>' +
                        '</div>' +
                        '<ul class="nav navbar-nav">' +
                          '<li><a href="./" >Dashboard</a></li>' +
                          '<li><a href="./addsong">Add Song</a></li>' +
                          '<!--<li><a href="./addsong_csv">Add Song CSV</a></li>-->' +
                          '<li><a href="./arrangements">Browse Songs</a></li>' +
                        '</ul>' +
                        '<ul class="nav navbar-nav navbar-right">' +
                          '<li><a href="#"><span class="glyphicon glyphicon-envelope"></span> Inbox</a></li>' +
                          '<li><a href="#"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>' +
                        '</ul>' +
                    '</div>' +
                '</nav>',
    controller: 'navbarCtrl'
  }})
  .controller('navbarCtrl', function ($scope, $location) {
    $scope.isActive = function(path){
        var currentPath = $location.path().split('/')[1];
        if (currentPath.indexOf('?') !== -1) {
            currentPath = currentPath.split('?')[0];
        }
        return currentPath === path.split('/')[1];
    }
  });
  
  