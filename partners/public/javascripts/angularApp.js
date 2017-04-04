angular.module('partners', ['ui.router'])

.config([
    "$stateProvider",
    "$urlRouterProvider",
    RouterFunction
])

.factory('ideas', ['$http', function($http) {
  var i = {
    ideas: []
  };
  i.getAll = function() {
  return $http.get('/ideas').success(function(data){
    angular.copy(data, i.ideas);
  });
}
  i.create = function(idea){
    return $http.post('/ideas', idea).success(function(data){
      i.ideas.push(data)
    })
  }

  i.upvote = function(idea) {
  return $http.put('/ideas/' + idea._id + '/upvote')
    .success(function(data){
      idea.upvotes += 1;
    });
};

  return i;
}])

.controller('MainCtrl', [
    '$scope',
     'ideas',
    function($scope, ideas) {
        $scope.test = 'Hello world!'

        $scope.ideas = ideas.ideas

        $scope.addIdea = function() {
            if ($scope.title === '') {
                return;
            }
            ideas.create({
                title: $scope.title,
                description: $scope.description
            });
            $scope.title = '';
            $scope.description = '';
        }

        $scope.incrementUpvotes = function(idea) {
            ideas.upvote(idea);
        }

    }])

.controller('IdeasCtrl', ['$scope',
'$stateParams',
'ideas',
function($scope, $stateParams, ideas){
  $scope.idea = ideas.ideas[$stateParams.id];

  $scope.addComment = function(){
  if($scope.body === '') { return; }
  $scope.idea.comments.push({
    body: $scope.body,
    author: 'user',
  });
  $scope.body = '';
};
}])

function RouterFunction($stateProvider, $urlRouterProvider) {
$stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['ideas', function(ideas){
            return ideas.getAll();
          }]
        }
      })
 .state('ideas', {
   url: '/ideas/{id}',
   templateUrl: '/ideas.html',
   controller: 'IdeasCtrl'
 })

$urlRouterProvider.otherwise('/home');
}
