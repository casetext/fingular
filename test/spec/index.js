MockFirebase.DEFAULT_DATA = {
};

describe('the "fingular" module', function() {

  it('exists', function() {
    expect(function() {
      module('fingular');
    }).not.to.Throw();
  });

});

describe('the "$firebaseRef" provider', function() {

  it(
    'fails without the firebaseDomain property on firebaseProvider ' +
    'or the firebaseDomain constant', function() {
    module('fingular');

    expect(function() {
      inject(function($firebaseRef) {});
    }).to.Throw();
  });

  it('succeeds when the firebaseDomain constant is provided', function(done) {

    module(function($provide) {
      $provide.constant('firebaseDomain', 'woot.firebaseio.com');
    });

    module('fingular');
    expect(function() {
      inject(function($firebaseRef) {});
    }).not.to.Throw();
    done();

  });

  describe('in a config block', function() {

    beforeEach(function() {
      angular.module('test', ['fingular'])
      .config(function($firebaseRefProvider) {
        $firebaseRefProvider.domain('override.firebaseio.com');
      })
      .service('fb', function($firebaseRef) {
        return $firebaseRef;
      });
    });

    it('succeeds when firebaseDomain is set on $firebaseRefProvider', function(done) {
      module('test');
      expect(function() {
        inject(function(fb) {});
      }).not.to.Throw();
      done();
    });

  });

  describe('with both configuration paths used', function() {

    beforeEach(function() {
      angular.module('test2', ['fingular'])
      .constant('firebaseDomain', 'woot.firebaseio.com')
      .config(function($firebaseRefProvider) {
        $firebaseRefProvider.domain('override.firebaseio.com');
      })
      .service('fb2', function($firebaseRef) {
        return $firebaseRef;
      });
    });

    it('prefers the value set on $firebaseRefProvider', function(done) {
      module('test2');
      inject(function(fb2) {
        expect(fb2.domain).to.equal('override.firebaseio.com');
        done();
      });
    });

  });

  describe('when mock mode is set', function() {

    it('distributes instances of the provided mocking prototype function', function() {
      angular.module('test3', ['fingular'])
      .config(function($firebaseRefProvider) {
        $firebaseRefProvider
        .domain('test.foo.com')
        .mockWith(MockFirebase);
      })
      .service('fb3', function($firebaseRef) {
        return $firebaseRef('/foo/bar/baz');
      });
      module('test3');
      inject(function(fb3) {
        expect(fb3).to.be.an.instanceof(MockFirebase);
      });
    });

    it('accepts mock data via the "mockOut" method on the provider', function() {
      angular.module('test5', ['fingular'])
      .config(function($firebaseRefProvider) {
        $firebaseRefProvider
        .domain('test.foo.com')
        .mockOut('/foo', 'bar')
        .mockWith(MockFirebase);
      })
      .service('fb5', function($firebaseRef) {
        return $firebaseRef;
      });
      module('test5');
      inject(function(fb5) {
        var fb = fb5('/foo');
        fb.on('value', function(snapshot) {
          expect(snapshot.val()).to.equal('bar');
        });
        fb.flush();
      });
    });
  });

});
