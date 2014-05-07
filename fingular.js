'use strict';

(function(angular, Firebase) {
  angular.module('fingular', [])
  .provider('$firebaseRef', function FirebaseRefProvider() {
    var firebaseDomain
      , protocol = 'https'
      , mockMode
      , mockFirebase
      , mockData = {};

    this['domain'] = function(newDomain) {
      firebaseDomain = newDomain;
      return this;
    };

    this['protocol'] = function(newProtocol) {
      switch(protocol) {
      case 'http':
      case 'https':
        protocol = newProtocol;
        break;
      default:
        throw new Error('Invalid protocol. Only http and https can be used!');
        break;
      }
      return this;
    }

    this['mockWith'] = function(mocker) {
      mockFirebase = mocker;
      mockMode = true;
      return this;
    };

    this['mockOut'] = function(path, data) {
      mockData[path] = data;
      return this;
    };

    this.$get = ['$injector', function($injector) {
      if (!(typeof(firebaseDomain) === 'string')) {
        if ($injector.has('firebaseDomain')) {
          firebaseDomain = $injector.get('firebaseDomain');
        } else {
          throw new Error('You must supply the domain name of your ' +
                          'Firebase account, either by providing the ' +
                          'constant \'firebaseDomain\' or by setting ' +
                          'the \'firebaseDomain\' property on the $firebaseProvider!');
        }
      }

      if ($injector.has('firebaseProtocol')) {
        protocol = $injector.get('firebaseProtocol');
      }

      if ($injector.has('firebaseMock') && mockFirebase === undefined) {
        mockFirebase = $injector.get('firebaseMock');
        mockMode = true;
      }

      if ($injector.has('firebaseMockData')) {
        angular.forEach($injector.get('firebaseMockData'), function(mockDatum, key) {
          // FIXME(goldibex): deep introspection of mock data, this is pretty simplistic
          if (!mockData[key]) {
            mockData[key] = mockDatum;
          }
        });
      }

      var injectable = function(path) {
        if (!path) {
          path = '/';
        } else if (path[0] !== '/') {
          path = '/' + path;
        }

        if (mockMode) {
          return new mockFirebase('Mock://' + firebaseDomain + path, mockData[path]);
        } else {
          return new Firebase(protocol + '://' + firebaseDomain + path);
        }
      };
      injectable.protocol = protocol;
      injectable.domain = firebaseDomain;
      injectable.mocked = mockMode === true;

      return injectable;
    }];
  })
  .provider('$firebaseUser', function FirebaseUserProvider() {

    var usersCollection = '/users'
      , userPromise
      , mockUserConstructor
      , mockUserData
      , mockMode
      , authMethod
      , authObj;

    this['usersCollection'] = function(newCollectionPath) {
      if (!newCollectionPath) {
        return usersCollection;
      } else {
        usersCollection = newCollectionPath;
        return this;
      }
    }

    this['mockWith'] = function(mocker) {
      mockUserConstructor = mocker;
      mockMode = true;
      return this;
    };

    this['mockUser'] = function(md) {
      mockUserData = md;
      return this;
    }

    this.$get = ['$log', '$q', '$injector', '$firebaseRef', '$rootScope', function($log, $q, $injector, $firebaseRef, $rootScope) {

      if ($injector.has('firebaseUserMockData')) {
        mockUserData = $injector.get('firebaseUserMockData');
      }
      if ($injector.has('firebaseUserMock')) {
        mockUserConstructor = $injector.get('firebaseUserMock');
        mockMode = true;
      }
      if ($injector.has('firebaseUserCollectionPath')) {
        usersCollection = $injector.get('firebaseUserCollectionPath');
      }

      var Constructor = mockMode ? mockUserConstructor : FirebaseSimpleLogin;

      function FirebaseUser() {
        var self = this
          , anonUser = { $anonymous: true };

        $rootScope.firebaseUser = anonUser;
        this._auth = new Constructor($firebaseRef(), function(err, authUser) {
          if (err) {
            delete $rootScope.firebaseUser;
            $rootScope.$apply(function() {
              $rootScope.$broadcast('firebaseUser:error', {
                code: 'authFailed',
                error: err
              });
            });
          } else if (authUser !== null) {
            self._getUserProfile(authUser);
          } else {
            $rootScope.$apply(function() {
              $rootScope.firebaseUser = anonUser;
              $rootScope.$broadcast('firebaseUser:auth', anonUser);
            });
          }
        }, mockUserData);

        this._getUserProfile = function(authUser) {
          // get a reference to the corresponding object in the user profile tree
          var userRef = $firebaseRef([usersCollection, authUser.uid].join('/'));
          userRef.transaction(function(currentData) {
            var newData = currentData || {};

            if (!newData.thirdPartyData) {
              newData.thirdPartyData = {};
            }
            if (authUser.accessToken) {
              newData.accessTokens = newData.accessTokens || {};
              newData.accessTokens[authMethod] = authUser.accessToken;
            }
            if (authUser.thirdPartyData) {
              newData.thirdPartyData[authMethod] = authUser.thirdPartyData;
            }
            if (authUser.displayName) {
              newData.displayName = authUser.displayName;
            }
            if (authUser.email) {
              newData.email = authUser.email;
            }
            return newData;
          }, function(err, committed, snapshot) {
            if (err) {
              $rootScope.$broadcast('firebaseUser:error', {
                code: 'getUserProfileFailed',
                error: err
              });
            } else if (!committed) {
              $rootScope.$broadcast('firebaseUser:error', {
                code: 'getUserProfileFailed',
                error: new Error('Transaction was aborted')
              });
            } else {
              $rootScope.firebaseUser = snapshot.val();
              $rootScope.firebaseUserRef = snapshot.ref();
              $rootScope.$broadcast('firebaseUser:auth', snapshot);
            }
          }, false);

          if (userRef.flush) {
            userRef.flush();
          }
        };

        /**
         * Logs in using the given authType, or hands back the currently logged-in user.
         * @param {String} requestedAuthMethod A Firebase-supported auth method string, like 'facebook'.
         * @param {Object} [data] Additional data to pass into the login request, like email and password.
         */

        this.login = function(requestedAuthMethod, data) {
          var deferred = $q.defer()
            , off1
            , off2;
          var off1, off2;

          off1 = $rootScope.$on('firebaseUser:auth', function(e, user) {
            off1();
            off2();
            deferred.resolve(user);
          });

          off2 = $rootScope.$on('firebaseUser:error', function(e, err) {
            off1();
            off2();
            deferred.reject(err);
          });

          self._auth.login(requestedAuthMethod, data);
          return deferred.promise;
        };

        this.logout = function() {
          self._auth.logout();
          $rootScope.$broadcast('firebaseUser:unauth');
        };

        this.createUser = function(email, password) {
          var deferred = $q.defer();

          self._auth.createUser(email, password, function(err, userData) {
            if (err) {
              $log.debug('user create failed');
              $log.debug(err);
              deferred.reject(err);
            } else {
              $rootScope.$apply(function() {
                var off = $rootScope.$on('firebaseUser:auth', function(e, user) {
                  off();
                  deferred.resolve(user);
                });

                self.login('password', {
                  email: email,
                  password: password
                });
              });
            }
          });
          return deferred.promise;
        };

        this.removeUser = function(email, password) {
          var deferred = $q.defer();
          self._auth.changePassword(email, password, function(err, ok) {
            if (ok) {
              deferred.resolve(ok);
            } else {
              deferred.reject(err);
            }
          });
          return deferred.promise;
        };

        this.changePassword = function(email, oldpassword, newpassword) {
          var deferred = $q.defer();
          self._auth.changePassword(email, oldpassword, newpassword, function(err, ok) {
            if (ok) {
              deferred.resolve(ok);
            } else {
              deferred.reject(err);
            }
          });
          return deferred.promise;
        };

        this.sendPasswordResetEmail = function(email) {
          var deferred = $q.defer();
          self._auth.sendPasswordResetEmail(email, function(err, ok) {
            if (ok) {
              deferred.resolve(ok);
            } else {
              deferred.reject(err);
            }
          });
          return deferred.promise;
        };
      };

      /**
       * Stamps a given Firebase reference with the current user's information,
       * and log the stamping on the user's own object.
       * @param {Firebase} reference A firebase reference pointing somewhere
       * @param {String} propName The name of the child on the reference to store the user's key. Defaults to 'user.'
       */
      this.stamp = function(reference, propName) {
        // Get the absolute path of the reference.
        var hostLength = reference.root().toString().length
          , path = decodeURI(reference.toString().slice(hostLength + 1))
          , logPath = [usersCollection, user.uid, 'log', path].join('/');

        // Log the revision in the user history.
          $firebaseRef(logPath).set((new Date()).getTime());
      };
      return new FirebaseUser();
    }];
  });
})(window.angular, window.Firebase);
