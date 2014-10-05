## Design Document of IsoGrid

This documents describe the implementation of IsoGrid.

### IsoGrid Module

This is the module for the IsoGrid library that will be injected in any module that uses the library.  

### IsoGrid Directive
#### Arguments
- `items` 
- `filters` : the list of filters
- `rankers` : the list of rankers


#### Events
- Watches `items` 
  * Triggers a reset

- Watches `filters`
  * Triggers a reset 

- Watches `rankers`
  * Triggers a reset 

- Watches `layout`
  * Triggers a reset 

#### Functions
- `reset()`
  * `FilterService.apply` to set `showing` property of items
  * `OrderService.apply` to set order of items array
  * `layout`

- `layout()`
  * For each item, if template not loaded, load template, compile it with the data and append HTML to the DOM
  * `PositionService.apply` to set `x`, `y` properties of items
  * Applies CSS transform

- `removeItem(itemId)`

### Position Service

- `apply(items, layout)`
  * Extract number of columns from mediaqueries
  * For each layout compute the list of optimized positions for the list of items
  * Returns the list of items with the updated positions
  * Fill the columns

### Filter Service
- `apply(items, filters)`
  * For each filters, for each item, if item does not pass, remove it from the list of items

### Order Service
- `apply(items, rankers)`
  * For first ranker, sort the array using ranker's criteria
  * If two items are equal under the first ranker's criteria use second ranker to separate them, etc.


### User Interface

#### CSS
- `mediaqueries`

