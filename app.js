angular
.module('partners', ['ui.router'])

.config([
    "$stateProvider",
    "$urlRouterProvider",
    RouterFunction
])

.factory('ideas', [function() {
  var idea = [
  ];
  return idea;
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
            $scope.ideas.push({
                title: $scope.title,
                description: $scope.description,
                upvotes: 0,
                comments:[
                  {author: 'Sam', body: 'Great idea!', upvote: 0},
                  {author: 'Steve', body: "I think that's already a product", upvote: 0}
                ]
            });
            $scope.title = '';
            $scope.description = '';
        }

        $scope.incrementUpvotes = function(idea) {
            idea.upvotes += 1;
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
    upvotes: 0
  });
  $scope.body = '';
};
}])

function RouterFunction($stateProvider, $urlRouterProvider) {
$stateProvider
    .state("home", {
        url: "/home",
        templateUrl: '/home.html',
        controller: 'MainCtrl'
 })
 .state('ideas', {
   url: '/ideas/{id}',
   templateUrl: '/ideas.html',
   controller: 'IdeasCtrl'
 })

$urlRouterProvider.otherwise('/home');
}
