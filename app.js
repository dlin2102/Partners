angular.module('partners', []);
.factory('ideas', [function() {
  var i = {
    ideas: [title:'idea',description:'descrip',upvotes:0]
  };
  return i;
}])
.controller('MainCtrl', [
    '$scope',
     ideas,
    function($scope, ideas) {
        $scope.test = 'Hello world!';


        $scope.ideas = ideas.ideas

        $scope.addIdea = function() {
            if ($scope.title === '') {
                return;
            }
            $scope.ideas.push({
                title: $scope.title,
                description: $scope.description,
                upvotes: 0
            });
            $scope.title = '';
            $scope.description = '';
        }

        $scope.incrementUpvotes = function(idea) {
            idea.upvotes += 1;
        };

    }
]);
