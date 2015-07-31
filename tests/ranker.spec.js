/* globals inject */
(function() {
  'use strict';

  describe('RankerService', function() {

    beforeEach(module('dynamicLayout'));

    it('check that apply function exists', inject(function(RankerService) {
      expect(RankerService.applyRankers).toBeDefined();
    }));

    it('check that rankers work properly',
      inject(function(RankerService) {

        var items = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65
          },
          {
            id: 2,
            color: 'green',
            atomicNumber: 4.2
          },
          {
            id: 3,
            color: 'black',
            atomicNumber: 4
          },
          {
            id: 4,
            color: 'grey',
            atomicNumber: 60
          },
          {
            id: 5,
            color: 'grey',
            atomicNumber: 1.8
          }
        ];

        var rankers = [
          ['color', 'asc'],
          ['atomicNumber', 'desc']
        ];

        var itemsRes = RankerService.applyRankers(angular.copy(items), rankers);

        expect(itemsRes[0].id).toEqual(3);
        expect(itemsRes[1].id).toEqual(2);
        expect(itemsRes[2].id).toEqual(4);
        expect(itemsRes[3].id).toEqual(5);
        expect(itemsRes[4].id).toEqual(1);

        var myCustomGetter = function(item) {
          if (item.atomicNumber > 5) {
            return 1;
          }
          return 0;
        };

        rankers = [
          [myCustomGetter, 'asc']
        ];
        itemsRes = RankerService.applyRankers(angular.copy(items), rankers);
        expect(itemsRes[0].id).toEqual(2);
        expect(itemsRes[1].id).toEqual(3);
        expect(itemsRes[2].id).toEqual(5);
        expect(itemsRes[3].id).toEqual(1);
        expect(itemsRes[4].id).toEqual(4);

      }));

  });

})();
