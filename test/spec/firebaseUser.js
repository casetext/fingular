MockFirebase.DEFAULT_DATA = {
};

MockFirebaseSimpleLogin.DEFAULT_FAIL_WHEN = function(provider, options, user) {
  var code, message;
  if( ['password', 'persona', 'anonymous', 'twitter', 'facebook', 'google', 'github'].indexOf(provider) === -1 ) {
    code = 'INVALID_AUTH_METHOD';
    message = 'Invalid authentication method';
  }
  else if( !user ) {
    code = 'INVALID_USER';
    message = 'The specified user does not exist';
  }
  else if( provider === 'password' && user.password !== options.password ) {
    code = 'INVALID_PASSWORD';
    message = 'The specified password is incorrect';
  }
  if (message) {
    var e = new Error(message);
    e.code = code;
    return e;
  } else {
    return null;
  }
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

    it('accepts mock data via the "mockOut" method on the provider', function() {
      inject(function($firebaseUser) {
        $firebaseUser.login('facebook').then(function(err, data) {
          expect(data.uid).to.equal(1);
          expect(data.displayName).to.equal('Freder Frederson');
          expect(data.hometown).to.equal('Metropolis');
        });
      });
    });
  });

 });

describe('the "$firebaseUser" service', function() {
  beforeEach(function() {
    module('fingular');
    module(function($provide) {
      $provide.constant('firebaseDomain', 'woot.firebaseio.com');
      $provide.constant('firebaseMock', MockFirebase);
      $provide.constant('firebaseMockData', {
        users: {}
      });
      $provide.constant('firebaseUserMock', MockFirebaseSimpleLogin);
      $provide.constant('firebaseUserMockData', {
        uid: 1,
        displayName: 'Freder Frederson',
        authToken: 'abcde',
        thirdPartyUserData: {
          location: 'San Francisco, CA',
          hometown: 'Metropolis'
        }
      });
    });
  });

  describe('#login', function() {
    it('fails on an invalid auth method', function(done) {
      inject(function($firebaseUser, $rootScope) {
        var promise = $firebaseUser.login('invalid');
        promise.catch(function() {
          done();
        });
        promise.authObj.flush();
        $rootScope.$apply();
      });
    });

    it('succeeds on a valid auth method', function(done) {
      inject(function($firebaseUser, $rootScope) {
        var promise = $firebaseUser.login('facebook');
        promise.then(function(userRef) {
          done();
        }, function(e) {
          throw e;
        }, function(notify) {
          notify.object.flush.call(notify.object);
        });
        promise.authRef.flush.call(promise.authRef);
        promise.authObj.flush(promise.authObj);
        $rootScope.$apply();
      });
    });
  })
});
