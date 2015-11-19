/* globals inject */
(function() {
  'use strict';

  describe('PositionService', function() {

    beforeEach(module('dynamicLayout'));

    it('check that apply function exists', inject(function(PositionService) {
      expect(PositionService.layout).toBeDefined();
    }));

    it('check that positions work properly',
      inject(function($q, PositionService) {

        var items = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65,
            height: 10,
            width: 100
          },
          {
            id: 2,
            color: 'green',
            atomicNumber: 4.2,
            height: 20,
            width: 100
          },
          {
            id: 3,
            color: 'black',
            atomicNumber: 4,
            height: 150,
            width: 100
          },
          {
            id: 4,
            color: 'grey',
            atomicNumber: 60,
            height: 60,
            width: 200
          },
          {
            id: 5,
            color: 'grey',
            atomicNumber: 1.8,
            height: 30,
            width: 100,
            centerH: true
          }
        ];


        // Disable DOM manipulation
        spyOn(PositionService, 'getItemsDimensionFromDOM')
            .and.returnValue(items);
        spyOn(PositionService, 'applyToDOM')
          .and.returnValue($q.defer().promise);


        // Test that items were properly set up in the grid
        // Input: list of items with their dimensions (width, height)
        // Output: x,y of each item

        var promise = PositionService.layout(300);
        expect(promise.then).toBeDefined();

        var columns = PositionService.getColumns();

        expect(columns[0].length).toEqual(3);
        expect(columns[1].length).toEqual(2);
        expect(columns[2].length).toEqual(1);

        expect(columns[0][0].id).toEqual(1);
        expect(columns[0][1].id).toEqual(4);
        expect(columns[0][2].id).toEqual(5);

        expect(columns[1][0].id).toEqual(2);
        expect(columns[1][1].id).toEqual(4);

        expect(columns[2][0].id).toEqual(3);

        //test for items that should be centered horizontaly
        items.forEach(function(item){
          if (item.centerH === true) {
            expect(item.x).toEqual((300-item.width)/2);
          }
        });
        //test individual items
        expect(items[0].x).toEqual(0);
        expect(items[1].x).toEqual(100);
        expect(items[2].x).toEqual(200);
        expect(items[3].x).toEqual(0);
        expect(items[4].x).toEqual((300-items[4].width)/2);


      }));

    it('check that item too large is detected and throws errors',
      inject(function(PositionService) {
        var items = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65,
            height: 10,
            width: 600
          }
        ];

        spyOn(PositionService, 'getItemsDimensionFromDOM')
          .and.returnValue(items);
        spyOn(PositionService, 'applyToDOM');

        expect(function() {
          PositionService.layout(300);
        }).toThrowError(Error, 'Item too large');

      })
    );

    it('check that item width is set to container width (fullWidth)',
      inject(function($q, PositionService) {

        var elParent = window.document.createElement('div');
        elParent.classList.add('dynamic-layout-item-parent');
        var elChild = window.document.createElement('div');
        //child have width=150px defined
        elChild.setAttribute('style','width:150px;');
        elChild.setAttribute('dynamic-layout-fullWidth','');
        elChild.innerHTML='<br/>Just a content</br>';
        elParent.appendChild(elChild);
        document.body.appendChild(elParent);

        // Disable DOM manipulation
        spyOn(PositionService, 'applyToDOM')
          .and.returnValue($q.defer().promise);

        var items = PositionService.getItemsDimensionFromDOM(300);

        //item set width=300px equal to width of container
        expect(items[0].width).toEqual(300);

      })
    );

    it('check that item with full width do not throws errors',
      inject(function(PositionService) {
        var items = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65,
            height: 10,
            width: 100,
            fullWidth: true
          }
        ];

        spyOn(PositionService, 'getItemsDimensionFromDOM')
          .and.returnValue(items);
        spyOn(PositionService, 'applyToDOM');

        expect(function() {
          PositionService.layout(300);
        }).not.toThrowError(Error, 'Item too large');

      })
    );
  });

})();
