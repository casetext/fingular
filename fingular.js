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
        if (path[0] !== '/') {
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

    this.$get = ['$injector', function($injector) {

    }];
  });

})(window.angular, window.Firebase);
