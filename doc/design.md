## Design Document of IsoGrid

This documents describe the implementation of IsoGrid.

### IsoGrid Module

This is the module for the IsoGrid library that will be injected in any module that uses the library.  

### IsoGrid Directive
#### Arguments
- `items` 
- `filters` : the list of filters
- `rankers` : the list of rankers

#### Variables
- `showingItems` : the items displaying after filtering and ordered

#### Events
- Watches `items` 
  * If items are updated triggers a reset

- Watches `filters`
  * If the filters are updated triggers a reset 

- Watches `rankers`
  * `OrderService.apply` 
  * `layout`

#### Functions
- `reset`
  * Set `showingItems` to copy of items
  * `FilterService.apply`
  * `OrderService.apply`
  * `layout`

- `layout`
  * Updates `showingItems` with `PositionService.get`
  * For each item, if template not loaded, load template and compile it with the data
  * Append items' HTML to the DOM


### Position Service

- `get(items, layout)`
  * Extract number of columns from mediaqueries
  * For each layout compute the list of optimized positions for the list of items
  * Returns the list of items with the updated positions

### Filter Service
- `apply(items, filters)`
  * For each filters, for each item, if item does not pass, remove it from the list of items

### Order Service
- `apply(items, rankers)`
  * For first ranker, sort the array using ranker's criteria
  * If two items are equal under the first ranker's criteria use second ranker to separate them, etc.


### User Interface

#### CSS