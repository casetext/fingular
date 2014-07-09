'use strict';

(function(angular, Firebase) {
  angular.module('fingular', [])
  .factory('ProxiedFirebase', ['$timeout', function($timeout) {

    var timeoutElapsed = function() {}
      , timeoutLimit = 10000;

    function ProxiedQuery(query) {
      this._ref = query;
    }

    ProxiedQuery.prototype = {
      on: function(eventType, callback, cancelCallback, context) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.on(eventType, function() {
          callback.apply(context, arguments);
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        }, function() {
          cancelCallback.apply(context, arguments);
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        }, context);
        return callback;
      },

      off: function() {
        this._ref.off(arguments);
      },

      once: function(eventType, successCallback, failureCallback, context) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.once(eventType, function() {
          successCallback.apply(context, arguments);
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        }, function() {
          failureCallback.apply(context, arguments);
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        }, context);
      },

      limit: function() {
        return new ProxiedQuery(this._ref.limit(arguments));
      },

      startAt: function() {
        return new ProxiedQuery(this._ref.startAt(arguments));
      },

      endAt: function() {
        return new ProxiedQuery(this._ref.endAt(arguments));
      },

      ref: function() {
        return new ProxiedFirebase(this._ref.ref());
      }
    };

    function ProxiedFirebase(ref) {
      this._ref = ref;

      if (typeof(this._ref.flush) === 'function') {
        this.flush = function() {
          this._ref.flush(arguments);
        };

      }
    }

    ProxiedFirebase.prototype = {

      toString: function() {
        return this._ref.toString(arguments);
      },

      auth: function(token, cb) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.auth(token, function(err) {
          cb(arguments);
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        });
      },

      unauth: function() {
        this._ref.unauth();
      },

      child: function(childPath) {
        return new ProxiedFirebase(this._ref.child(childPath));
      },

      parent: function() {
        return new ProxiedFirebase(this._ref.parent());
      },

      root: function() {
        return new ProxiedFirebase(this._ref.root());
      },

      name: function() {
        return this._ref.name();
      },

      set: function(value, onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.set(value, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        });
      },

      update: function(value, onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.update(value, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

        });
      },

      remove: function(onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.remove(function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

        });
      },

      push: function(value, onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.push(value, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

        });
      },

      setWithPriority: function(value, priority, onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.setWithPriority(value, priority, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

        });
      },

      setPriority: function(priority, onComplete) {

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.setPriority(priority, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

        });
      },

      transaction: function(updateFn, onComplete, applyLocally) {

        var timeout;

        this._ref.transaction(function() {

          // start timeout
          timeout = $timeout(timeoutElapsed, timeoutLimit);

          updateFn(arguments);
        }, function(err) {
          onComplete(arguments);

          // cancel timeout
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }
        }, applyLocally);

      },

      on: ProxiedQuery.prototype.on,
      off: ProxiedQuery.prototype.off,
      once: ProxiedQuery.prototype.once,
      limit: ProxiedQuery.prototype.limit,
      startAt: ProxiedQuery.prototype.startAt,
      endAt: ProxiedQuery.prototype.endAt

    };

    return ProxiedFirebase;
  }])
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

    this.$get = ['$timeout', '$injector', 'ProxiedFirebase', function($timeout, $injector, ProxiedFirebase) {
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
          return new ProxiedFirebase(
            new mockFirebase('Mock://' + firebaseDomain + path, mockData[path])
          );
        } else {
          return new ProxiedFirebase(
            new Firebase(protocol + '://' + firebaseDomain + path)
          );
        }
      };
      injectable.protocol = protocol;
      injectable.domain = firebaseDomain;
      injectable.mocked = mockMode === true;

      return injectable;
    }];
  })
  .provider('$firebaseUser', function FirebaseUserProvider() {

    var userPromise
      , mockUserConstructor
      , mockUserData
      , mockMode
      , authMethod
      , authObj;

    this['mockWith'] = function(mocker) {
      mockUserConstructor = mocker;
      mockMode = true;
      return this;
    };

    this['mockUser'] = function(md) {
      mockUserData = md;
      return this;
    }

    this.$get = [
      '$log',
      '$q',
      '$injector',
      '$rootScope',
      '$firebaseRef',
      function($log, $q, $injector, $rootScope, $firebaseRef) {

        if ($injector.has('firebaseUserMockData')) {
          mockUserData = $injector.get('firebaseUserMockData');
        }
        if ($injector.has('firebaseUserMock')) {
          mockUserConstructor = $injector.get('firebaseUserMock');
          mockMode = true;
        }

        var Constructor = mockMode ? mockUserConstructor : FirebaseSimpleLogin;

        function FirebaseUser() {
          var self = this;

          this._auth = new Constructor($firebaseRef(), function(err, authUser) {
            if (err) {
              $rootScope.$apply(function() {
                $rootScope.$broadcast('firebaseUser:error', err);
              });
            } else if (authUser !== null) {
              $rootScope.$apply(function() {
                $rootScope.$broadcast('firebaseUser:auth', authUser);
              });
            } else {
              $rootScope.$apply(function() {
                $rootScope.$broadcast('firebaseUser:unauth', authUser);
              });
            }
          }, mockUserData);

          /**
           * Logs in using the given authType, or hands back the currently logged-in user.
           * @param {String} requestedAuthMethod A Firebase-supported auth method string, like 'facebook'.
           * @param {Object} [data] Additional data to pass into the login request, like email and password.
           */
          this.login = function(requestedAuthMethod, data) {
            var deferred = $q.defer()
              , off1
              , off2;

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
      }
    ];
  });
})(window.angular, window.Firebase);
