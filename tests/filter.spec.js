/* globals inject */
(function() {
  'use strict';

  describe('FilterService', function() {

    beforeEach(module('dynamicLayout'));

    it('check that apply function exists', inject(function(FilterService) {
      expect( FilterService.applyFilters ).toBeDefined();
    }));

    it('check that filter service work properly',
      inject(function(FilterService) {

        var mockedItems = [
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

        var filters = [ // an AND goup compose of OR groups
          [ // an OR group compose of statements
            ['color', '=', 'grey'], // A statement
            ['color', '=', 'black']
          ],
          [ // a second OR goup composed of statements
            ['atomicNumber', '<', 3]
          ]
        ];

        var itemsRes = FilterService.applyFilters(mockedItems, filters);

        expect(itemsRes.length).toEqual(1);
        expect(itemsRes[0].id ).toEqual(5);

        var myCustomFilter = function(item) {
          if (item.color !== 'red') {
            return true;
          }
          return false;
        };

        filters = [
          [myCustomFilter]
        ];

        itemsRes = FilterService.applyFilters(mockedItems, filters);
        expect(itemsRes.length).toEqual(4);
      })
    );

    it('check that the filter service reject invalid comparators',
      inject(function(FilterService) {

        var mockedItems = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65
          }
        ];

        var filters = [[
            ['atomicNumber', 'invalid']
        ]];

        expect(function() {
          FilterService.applyFilters(mockedItems, filters);
        }).toThrow('Incorrect statement');

        filters = [[
            ['atomicNumber', 'invalid', 3]
        ]];

        expect(function() {
          FilterService.applyFilters(mockedItems, filters);
        }).toThrow('Incorrect statement comparator: invalid');

      })
    );

    it('check that the filter service reject invalid property for\
      "contains" comparator',
      inject(function(FilterService) {
        var mockedItems = [
          {
            id: 1,
            color: 'red',
            atomicNumber: 45.65
          }
        ];

        var filters = [[
            ['atomicNumber', 'contains', 45]
        ]];

        expect(function() {
          FilterService.applyFilters(mockedItems, filters);
        }).toThrow('contains statement has to be applied on array');
      })
    );

  });

})();
