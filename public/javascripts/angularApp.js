angular.module('partners', ['ui.router'])

    .config([
        "$stateProvider",
        "$urlRouterProvider",
        RouterFunction
    ])

    .factory('auth', ['$http', '$window', function($http, $window) {
        var auth = {};
        auth.saveToken = function(token) {
            $window.localStorage['partners-token'] = token;
        };

        auth.getToken = function() {
            return $window.localStorage['partners-token'];
        }
        auth.isLoggedIn = function() {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function(user) {
            return $http.post('/register', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user) {
            return $http.post('/login', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('partners-token');
        };

        return auth;
    }])

    .factory('ideas', ['$http', 'auth', function($http, auth) {
        var i = {
            ideas: []
        };
        i.getAll = function() {
            return $http.get('/ideas').success(function(data) {
                angular.copy(data, i.ideas);
            });
        }
        i.get = function(id) {
            return $http.get('/ideas/' + id).then(function(res) {
                return res.data;
            });
        };

        i.delete = function(idea) {
            return $http.delete('/ideas/' + idea._id, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function(data) {
                angular.copy(data, i.ideas)
            })
        }

        i.create = function(idea) {
            return $http.post('/ideas', idea, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function(data) {
                i.ideas.push(data)
            })
        }

        i.upvote = function(idea) {
            return $http.put('/ideas/' + idea._id + '/upvote', null, {
                headers: {
                    Authorization: 'Bearer ' +auth.getToken()
                }
            }).success(function(data) {
                idea.upvotes += 1;
            });
        };

        i.addComment = function(id, comment) {
            return $http.post('/ideas/' + id + '/comments', comment, {
                    headers: {
                        Authorization: 'Bearer ' +auth.getToken()}
                });
        };

        return i;
    }])

    .controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',
        function($scope, $state, auth) {
            $scope.user = {};

            $scope.register = function() {
                auth.register($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('home');
                });
            };

            $scope.logIn = function() {
                auth.logIn($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('home');
                });
            };
        }
    ])

    .controller('MainCtrl', [
        '$scope',
        'ideas',
        'auth',
        function($scope, ideas, auth) {
            $scope.test = 'Hello world!'

            $scope.ideas = ideas.ideas
            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.addIdea = function() {
                if ($scope.title === '') {
                    return;
                }
                ideas.create({
                    title: $scope.title,
                    description: $scope.description,
                    image_url: $scope.image_url
                });
                $scope.title = '';
                $scope.description = '';
                $scope.image_url = '';
            }
            $scope.deleteIdea = function(idea) {
                ideas.delete(idea)
            }
            $scope.incrementUpvotes = function(idea) {
                ideas.upvote(idea);
            }

        }
    ])

    .controller('IdeasCtrl', ['$scope',
        'ideas',
        'idea',
        'auth',
        function($scope, ideas, idea, auth) {
            $scope.idea = idea;
            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.addComment = function() {
                if ($scope.body === '') {
                    return;
                }
                ideas.addComment(idea._id, {
                    body: $scope.body,
                    author: 'user',
                }).success(function(comment) {
                    $scope.idea.comments.push(comment);
                })
                $scope.body = '';
            }
        }
    ])

    .controller('NavCtrl', [
        '$scope',
        'auth',
        function($scope, auth) {
            $scope.isLoggedIn = auth.isLoggedIn;
            $scope.currentUser = auth.currentUser;
            $scope.logOut = auth.logOut;
        }
    ]);


function RouterFunction($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['ideas', function(ideas) {
                    return ideas.getAll();
                }]
            }
        })
        .state('ideas', {
            url: '/ideas/{id}',
            templateUrl: '/ideas.html',
            controller: 'IdeasCtrl',
            resolve: {
                idea: ['$stateParams', 'ideas', function($stateParams, ideas) {
                    return ideas.get($stateParams.id);
                }]
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        })
        .state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });

    $urlRouterProvider.otherwise('/home');
}
