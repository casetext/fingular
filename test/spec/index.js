describe('the "firebase" module', function() {
  it('exists', function() {
    expect(function() {
      module('firebase');
    }).not.to.Throw();
  });
});

describe('the "$firebase" provider', function() {
  it(
    'fails without the firebaseDomain property on firebaseProvider ' +
    'or the firebaseDomain constant', function() {
    module('firebase');

    expect(function() {
      inject(function($firebase) {});
    }).to.Throw();
  });

  it('succeeds when the firebaseDomain constant is provided', function() {

    module(function($provide) {
      $provide.constant('firebaseDomain', 'woot.firebaseio.com');
    });

    module('firebase');
    expect(function() {
      inject(function($firebase) {});
    }).not.to.Throw();
  });

  describe('in a config block', function() {
    beforeEach(function() {
      angular.module('test', ['firebase'])
      .config(function($firebaseProvider) {
        $firebaseProvider.setDomain('override.firebaseio.com');
      })
      .service('fb', function($firebase) {
        return $firebase;
      });
    });

    it('succeeds when firebaseDomain is set on $firebaseProvider', function() {

      module('test');
      expect(function() {
        inject(function(fb) {});
      }).not.to.Throw();
    });
  });

  describe('with both configuration paths used', function() {
    beforeEach(function() {
      angular.module('test2', ['firebase'])
      .constant('firebaseDomain', 'woot.firebaseio.com')
      .config(function($firebaseProvider) {
        $firebaseProvider.setDomain('override.firebaseio.com');
      })
      .service('fb2', function($firebase) {
        return $firebase;
      });
    });

    it('prefers the value set on $firebaseProvider', function() {
      module('test2');
      inject(function(fb2) {
        expect(fb2.domain).to.equal('override.firebaseio.com');
      });
    });
  });

});
