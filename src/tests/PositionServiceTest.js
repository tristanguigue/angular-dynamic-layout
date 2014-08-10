
describe('FilterService', function(){
    
    beforeEach(module('isoGrid'));
    
    it('apply function exists', inject(function(videoService){ 
            expect( videoService.get() ).not.toEqual(null);
    }))

    it('getOne function exists', inject(function(videoService){ 
            expect( videoService.getOne() ).not.toEqual(null);
    }))

    it('test fake http call',
      inject(function(videoService, $httpBackend) {


        videoService.get()
          .then(function(data) {
            expect(data[0].id).toEqual(1);
        });

        videoService.getOne(1)
          .then(function(data) {
            expect(data.name).toEqual("The Donkey goes to Eidolon");
        });

      }));
});

