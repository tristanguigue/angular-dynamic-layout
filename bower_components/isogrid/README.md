# What is this?

IsoGrid is an angularJS (no jQuery) approach to dynamic grids. It is inspired from the successfull [jQuery isotope library](http://isotope.metafizzy.co/) and its underlying [masonry layout](http://masonry.desandro.com/)

Including jQuery isotope into angularJS directives gets easily hacky. This reproduces the layout behavior while 
taking full advantage of `ngRepeat` filtering and ordering as well as `ngAnimate` module.

It is meant to be a very light and customizable frame leaving a lot of freedom to the user, especially regarding templates, animations and overall design and responsiveness.

This is a beta version and not production-ready.

# Demo
- [Demo](http://tristanguigue.github.io/IsoGrid)
- [Demo Code](https://github.com/tristanguigue/IsoGrid/tree/gh-pages)

# Installation

````
bower install isogrid
```
# Usage
Controller:
````
$scope.cards = [
  {
    template : "app/partials/aboutMe.html",
    tabs : ["home", "personal"],
    added : 1454871272105
  },
  {
    template : "app/partials/businessCard.html",
    tabs : ["home"],
    added : 1434871272105
  }
];
````
Template:
````  
<div isogrid items="cards"></div>
````

## Cards

IsoGrid items must have a template property, this template will be dynamically included using the `ng-include` directive.

- Content: the templates' content is entirely up to you. 

- Controller: each card can have its specific controller, you can also have a common controller for all cards. For example: 
````
<!-- aboutMe.html -->
<div ng-controller="aboutMeController">
  My Card
</div>
````

- External Scope: to reach the controller that injected the cards from the cards themselves you can use `externalScope()`

- Data: you can provide any data to your templates from the list of cards, for example:

Contoller:
````
$scope.cards = [
  {
    template : "app/partials/work1.html",
    tabs : ["home", "work"],
    data : {
      "position" : "Web Developer",
      "company" : "Hacker Inc."
    },
    added : 1414871272105,
  },
  {
    template : "app/partials/work1.html",
    tabs : ["home", "work"],
    data : {
      "position" : "Data Scientist",
      "company" : "Big Data Inc."
    },
    added : 1423871272105,
  }
];
````
Template:
````
<div>
  <div>
    <p>Position</p>
    <h4>{{it.data.position}}</h4>
  </div>
  <div>
    <p>Company</p>
    <h4>{{it.data.company}}</h4>
  </div>
</div>
````

## Responsiveness and mediaqueries
To make IsoGrid responsive just create a set of media queries that ajust the size of your cards and of the container. IsoGrid will find the container and cards widths on its own.

## Animations
The animations are based on the `ngAnimate` module, they are also up to you. Here are the available animations:

- `move-items-animation`: use this class to animate the movement of the cards between two positions, for example:
````
.move-items-animation{
  transition-property: left, top;
  transition-duration: 1s;
  transition-timing-function: ease-in-out;
}
````
- `ng-enter` and `ng-leave`: you can animate the entering and leaving of your cards in the grid, for example when applying filters: 

````
.isogrid-item-parent.ng-enter{
  transition: .5s ease-in-out;
  opacity:0;
}
.isogrid-item-parent.ng-enter.ng-enter-active{
  opacity:1;
}

.isogrid-item-parent.ng-leave{
  transition: .5s ease-in-out;
  opacity:1;
}
.isogrid-item-parent.ng-leave.ng-leave-active{
  opacity:0;
}
````

## Features

### Filtering
You can provide and update a list of filters like this: 
````
<div isogrid items="cards" filters="filters"></div>
````
Those filters needs to be in the [Conjuctive Normal Form](http://en.wikipedia.org/wiki/Conjunctive_normal_form). Basically a list of and groups composed of or groups. Each statement contains the property to be evaluated, a comparator and the value(s) allowed. For example:
````
var filters = [ // an AND goup compose of OR groups
  [ // an OR group compose of statements
    ['color', '=', 'grey'], // A statement
    ['color', '=', 'black']
  ],
  [ // a second OR goup composed of statements
    ['atomicNumber', '<', 3]
  ]
];
````
The list of comparators available are: 
````
['=', '<', '>', '<=', '>=', '!=', 'in', 'not in', 'contains']
````
#### Custom filters

You can make your own filters by providing any function that takes the item as input and returns a boolean. For example:
````
var myCustomFilter = function(item){
  if(item.color != 'red')
    return true;
  else
    return false;
};

filters = [
  [myCustomFilter]
];
````

### Sorting
You can provide and update a list of rankers like this: 
````
<div isogrid items="cards" rankers="rankers"></div>
````
Each ranker contains the property to be evaluated and the order. If two items are the same regarding the first ranker, the second one is used to part them, etc. 
````
var rankers = [ 
  ["color", "asc"], 
  ["atomicNumber", "desc"]
];
````
#### Custom rankers

You can make your own ranker by providing any function that takes the item as input and returns a value to be evaluated. For example:

````
var myCustomGetter = function(item){
  if(item.atomicNumber > 5) return 1;
  else return 0;
};

rankers = [
  [myCustomGetter, "asc"]
];
````

### Adding and removing items

You can add or remove any items from the cards list controller and the IsoGrid directive will detect it. For example:
````
$scope.cards.splice(index, 1);
````

### Triggering layout and callback
If a card is modified in any way (expanded for example) you can trigger a layout by broacasting in the `$rootScope`. Once the animations are completed the callback will be executed.

````
$scope.toggleText = function(){
  $scope.showingMoreText = !$scope.showingMoreText;
  // We need to broacast the layout on the next digest once the text
  // is actually shown
  $timeout(function(){
    $rootScope.$broadcast("layout", function(){
      // The layout animations have completed
    });
  });
}
````




