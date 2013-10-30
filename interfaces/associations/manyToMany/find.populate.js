var Waterline = require('waterline'),
    taxiFixture = require('../support/manyToMany.taxi.fixture'),
    driverFixture = require('../support/manyToMany.driver.fixture'),
    assert = require('assert');

describe('Association Interface', function() {

  /////////////////////////////////////////////////////
  // TEST SETUP
  ////////////////////////////////////////////////////

  var Taxi, Driver;

  before(function(done) {
    var waterline = new Waterline();

    waterline.loadCollection(taxiFixture);
    waterline.loadCollection(driverFixture);

    Events.emit('fixture', taxiFixture);
    Events.emit('fixture', driverFixture);

    waterline.initialize({ adapters: { test: Adapter }}, function(err, collections) {
      if(err) return done(err);

      Taxi = collections.taxi;
      Driver = collections.driver;

      done();
    });
  });


  describe('Many To Many Association', function() {

    /////////////////////////////////////////////////////
    // TEST SETUP
    ////////////////////////////////////////////////////

    var driverRecord;

    before(function(done) {
      Driver.create({ name: 'manymany find'}, function(err, driver) {
        if(err) return done(err);

        driverRecord = driver;

        var taxis = [];
        for(var i=0; i<2; i++) {
          driverRecord.taxis.add({ medallion: i });
        }

        driverRecord.save(function(err) {
          if(err) return done(err);
          done();
        });
      });
    });

    describe('.find', function() {

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should return taxis when the populate criteria is added', function(done) {
        Driver.find({ name: 'manymany find' })
        .populate('taxis')
        .exec(function(err, drivers) {
          if(err) return done();

          assert(Array.isArray(drivers));
          assert(drivers.length === 1);
          assert(Array.isArray(drivers[0].taxis));
          assert(drivers[0].taxis.length === 2);

          done();
        });
      });

      it('should not return a taxis object when the populate is not added', function(done) {
        Driver.find()
        .exec(function(err, drivers) {
          if(err) return done(err);

          var obj = drivers[0].toJSON();
          assert(!obj.taxis);

          done();
        });
      });

      it('should call toJSON on all associated records if available', function(done) {
        Driver.find({ name: 'manymany find' })
        .populate('taxis')
        .exec(function(err, drivers) {
          if(err) return done(err);

          var obj = drivers[0].toJSON();
          assert(!obj.name);

          assert(Array.isArray(obj.taxis));
          assert(obj.taxis.length === 2);

          assert(obj.taxis[0].hasOwnProperty('createdAt'));
          assert(!obj.taxis[0].hasOwnProperty('medallion'));
          assert(obj.taxis[1].hasOwnProperty('createdAt'));
          assert(!obj.taxis[1].hasOwnProperty('medallion'));

          done();
        });
      });

    });
  });
});
