MockFirebase.DEFAULT_DATA = {
};

describe('the "$firebaseUser" provider', function() {
  it(
    'fails if $firebaseRef isn\'t configured correctly', function() {
    module('fingular');

    expect(function() {
      inject(function($firebaseUser) {});
    }).to.Throw();
  });

  it('succeeds when $firebaseRef is configured', function(done) {

    module(function($provide) {
      $provide.constant('firebaseDomain', 'woot.firebaseio.com');
    });

    module('fingular');
    expect(function() {
      inject(function($firebaseRef) {});
    }).not.to.Throw();
    done();
  });

  describe('when mock mode is set', function() {

    beforeEach(function() {
      module('fingular', function($firebaseRefProvider) {
        $firebaseRefProvider
        .domain('test.foo.com')
        .mockWith(MockFirebase);
      });

      function MockUserPrototype(path, cb, data) {
        this.data = data;
        this.login = function(authType) {
          this.authType = authType;
          setTimeout(function() {
            cb(null, data);
          }, 1); 
        };
      }

      module(function($firebaseUserProvider) {
        $firebaseUserProvider
        .mockWith(MockUserPrototype)
        .mockUser({
          uid: 1,
          displayName: 'Freder Frederson',
          hometown: 'Metropolis'
        });
      });
    });

    it('distributes instances of the provided mocking prototype function', function() {
      inject(function($firebaseUser) {
        $firebaseUser.login('facebook').then(function(err, data) {
          expect(data.uid).to.equal(1);
          expect(data.displayName).to.equal('Freder Frederson');
          expect(data.hometown).to.equal('Metropolis');
        });
      });
    });

    it('accepts mock data via the "mockOut" method on the provider', function() {

    });
  });

 });

describe('the "$firebaseUser" service', function() {
  beforeEach(function() {
    module(function($provide) {
      $provide.constant('firebaseDomain', 'woot.firebaseio.com');
    });
  });


});
