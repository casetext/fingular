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
        var self = this;
        angular.forEach(data, function(v, k) {
          self[k] = v;
        });
        this.login = function(authType) {
          this.authType = authType;
          cb(null, data);
        };
      }

      module(function($firebaseRefProvider, $firebaseUserProvider) {
        $firebaseRefProvider
        .mockWith(MockFirebase)
        .mockOut('/users/1', {
          'foo': 'bar'
        });
        $firebaseUserProvider
        .mockWith(MockUserPrototype)
        .mockUser({
          uid: 1,
          displayName: 'Freder Frederson'
        });
      });
    });

    it('accepts mock data via the "mockOut" method on the provider', function(done) {
      inject(function($firebaseUser, $rootScope) {
        var off = $rootScope.$on('firebaseUser:auth', function(e, userSnap) {
          var data = userSnap.val();
          expect(data.displayName).to.equal('Freder Frederson');
          off();
          done();
        });
        $firebaseUser.login('facebook');
        $rootScope.$apply();
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

  it('hands back an anonymous user before authentication is tried', function() {
    inject(function($rootScope, $firebaseUser) {
      expect($rootScope.firebaseUser.$anonymous).to.be.true;
    });
  });

  describe('#login', function() {
    it('fails on an invalid auth method', function(done) {
      inject(function($firebaseUser, $rootScope) {
        $firebaseUser.login('invalid').catch(function() {
          done();
        });
        $firebaseUser._auth.flush();
        $rootScope.$digest();
      });
    });

    it('succeeds on a valid auth method', function(done) {
      inject(function($rootScope, $firebaseUser) {
        $firebaseUser.login('facebook').then(function() {
          done();
        });
        $firebaseUser._auth.flush();
        $rootScope.$digest();
      });
    });
  });

  describe('#logout', function() {
    it('logs out the currently existing user', function(done) {
      inject(function($firebaseUser, $rootScope) {
        var off = $rootScope.$on('firebaseUser:unauth', function() {
          off();
          done();
        });
        $firebaseUser.logout();
        $firebaseUser._auth.flush();
      });
    });
  });
  
  describe('#createUser', function() {
    it('returns a promise to create a new user', function(done) {
      inject(function($firebaseUser, $rootScope) { 
        $firebaseUser.logout();
        $firebaseUser._auth.flush();
        $firebaseUser.createUser('john@foo.com', 'foobar').then(function(ref) {
          done();
        }, function(err) {
          throw(err);
        });
        $firebaseUser._auth.flush();
        $rootScope.$digest();
        $firebaseUser._auth.flush();
        $rootScope.$digest();
      });
    });
  
  });
  
  describe('#removeUser', function() {
  });
  
  describe('#changePassword', function() {
  });
  
  describe('#sendPasswordResetEmail', function() {
  
  });
});
