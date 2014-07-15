'use strict';

(function(angular, Firebase) {

  var noop = function() {};

  angular.module('fingular', [])
  .factory('ProxiedFirebase', ['$timeout', function($timeout) {

    var timeoutElapsed = noop
      , timeoutLimit = 10000
      , catchupTime = 50;

    function ProxiedSnapshot(snap) {
      this._snap = snap;
    }

    ProxiedSnapshot.prototype = {
      val: function() {
        return this._snap.val();
      },

      child: function() {
        return this._snap.child.apply(this._snap, arguments);
      },

      forEach: function(cb) {
        return this._snap.forEach(function(childSnap) {
          if (cb(new ProxiedSnapshot(childSnap)) === true) {
            return true;
          }
        });
      },

      hasChild: function() {
        return this._snap.hasChild.apply(this._snap, arguments);
      },

      hasChildren: function() {
        return this._snap.hasChildren.apply(this._snap, arguments);
      },

      name: function() {
        return this._snap.name.apply(this._snap, arguments);
      },

      numChildren: function() {
        return this._snap.numChildren();
      },

      ref: function() {
        return new ProxiedFirebase(this._snap.ref());
      },

      getPriority: function() {
        return this._snap.getPriority();
      },

      exportVal: function() {
        return this._snap.exportVal();
      }

    };

    function ProxiedQuery(query) {
      this._ref = query;
    }

    ProxiedQuery.prototype = {
      on: function(eventType, callback, cancelCallback, context) {

        callback = callback || noop;
        cancelCallback = cancelCallback || noop;

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.on(eventType, function(snap, prevName) {

          var error;

          try {
            callback.call(context, new ProxiedSnapshot(snap), prevName);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        }, function() {

          var error;

          try {
            cancelCallback.apply(context, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        }, context);
        return callback;
      },

      off: function() {
        this._ref.off.apply(this._ref, arguments);
      },

      once: function(eventType, successCallback, failureCallback, context) {

        successCallback = successCallback || noop;
        failureCallback = failureCallback || noop;

        var timeout = $timeout(timeoutElapsed, timeoutLimit);

        this._ref.once(eventType, function(snap, prevName) {

          var error;

          try {
            successCallback.call(context, new ProxiedSnapshot(snap), prevName);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        }, function() {

          var error;

          try {
            failureCallback.apply(context, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        }, context);
      },

      limit: function() {
        return new ProxiedQuery(
          this._ref.limit.apply(this._ref, arguments)
        );
      },

      startAt: function() {
        return new ProxiedQuery(
          this._ref.startAt.apply(this._ref, arguments)
        );
      },

      endAt: function() {
        return new ProxiedQuery(
          this._ref.endAt.apply(this._ref, arguments)
        );
      },

      ref: function() {
        return new ProxiedFirebase(
          this._ref.ref()
        );
      }
    };

    function ProxiedFirebase(ref) {
      this._ref = ref;

      if (typeof(this._ref.flush) === 'function') {
        this.flush = function() {
          this._ref.flush.apply(this._ref, arguments);
        };

      }
    }

    ProxiedFirebase.prototype = {

      toString: function() {
        return this._ref.toString.apply(this._ref, arguments);
      },

      auth: function(token, cb) {
        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        cb = cb || noop;

        this._ref.auth(token, function(err) {

          var error;

          try {
            cb.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
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
        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        this._ref.set(value, function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        });
      },

      update: function(value, onComplete) {
        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        this._ref.update(value, function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }

        });
      },

      remove: function(onComplete) {
        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        this._ref.remove(function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }

        });
      },

      push: function(value, onComplete) {
        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        return new ProxiedFirebase(this._ref.push(value, function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }

        }));
      },

      setWithPriority: function(value, priority, onComplete) {

        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        this._ref.setWithPriority(value, priority, function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }

        });
      },

      setPriority: function(priority, onComplete) {

        var that = this
          , timeout = $timeout(timeoutElapsed, timeoutLimit);

        onComplete = onComplete || noop;

        this._ref.setPriority(priority, function(err) {

          var error;

          try {
            onComplete.apply(that, arguments);
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }

        });
      },

      transaction: function(updateFn, onComplete, applyLocally) {

        var timeout
          , that = this;

        onComplete = onComplete || noop;

        this._ref.transaction(function() {

          // start timeout
          timeout = $timeout(timeoutElapsed, timeoutLimit);

          return updateFn.apply(that, arguments);
        }, function(err, committed, snap) {

          var error;

          try {
            onComplete.call(that, err, committed, new ProxiedSnapshot(snap));
          } catch(e) {
            error = e;
          } finally {

            // cancel timeout
            if (timeout) {
              $timeout.cancel(timeout);
            }

            if (error) {
              throw(error);
            }
          }
        })
      },

      on: ProxiedQuery.prototype.on,
      off: ProxiedQuery.prototype.off,
      once: ProxiedQuery.prototype.once,
      limit: ProxiedQuery.prototype.limit,
      startAt: ProxiedQuery.prototype.startAt,
      endAt: ProxiedQuery.prototype.endAt,
      ref: function() {
        return this;
      }
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
