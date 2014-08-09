## Requirements for an AngularJS implementation of the Isotope plugin

This library is meant to be an implementation of the Isotope plugin in angular. Trying to implement the Isotope plugin within AngularJS through a directive leads to many compatibilities issues between jquery and angular.

Taking advantage of the `ng-animate` directive of AngularJS, we have an easy way of implementing CSS3 animation within the AngularJS framework.

### Main Functionality

Provide a grid model for a set of items, the grid model will take care of placing the items on the page according to a layout. The set of items will be a list of templates - already loaded or not - and optionally data to compile in the model. It will listen for any modification in the items display to generate a layout.

### Features

#### Sorting

The user will be able to provide a property or a custom function to sort the items.

#### Filtering

The user will be able to provide a statement on a property or a custom function to filter the items

