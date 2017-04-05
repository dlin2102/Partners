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
i.get = function(id) {
  return $http.get('/ideas/' + id).then(function(res){
    return res.data;
  });
};

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
i.addComment = function(id, comment) {
  return $http.post('/ideas/' + id + '/comments', comment)
}
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
'ideas',
'idea',
function($scope, ideas, idea){
  $scope.idea = idea;

  $scope.addComment = function(){
  if($scope.body === '') { return; }
  ideas.addComment(idea._id, {
    body: $scope.body,
    author: 'user',
  }).success(function(comment) {
    $scope.idea.comments.push(comment);
  })
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
   controller: 'IdeasCtrl',
   resolve: {
     idea: ['$stateParams', 'ideas', function($stateParams, ideas){
       return ideas.get($stateParams.id);
     }]
   }
 });

$urlRouterProvider.otherwise('/home');
}
