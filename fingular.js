'use strict';

(function(angular) {
angular.module('firebase', [])
  .provider('$firebase', function FirebaseProvider() {
    this.setDomain = function(newDomain) {
      this.firebaseDomain = newDomain;
    };

    this.$get = ['$injector', function($injector) {
      if (!(this.firebaseDomain instanceof String)) {
        if ($injector.has('firebaseDomain')) {
          this.firebaseDomain = $injector.get('firebaseDomain');
        } else {
          throw new Error('You must supply the domain name of your ' +
                          'Firebase account, either by providing the ' +
                          'constant \'firebaseDomain\' or by setting ' +
                          'the \'firebaseDomain\' property on the $firebaseProvider!');
        }
      }

      var injectable = function(path) {
      };
      injectable.domain = this.firebaseDomain;
      return injectable;
    }];
  });

})(window.angular);
