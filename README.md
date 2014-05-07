fingular
========

Unit test your Angular/Firebase applications using a mocked-out Firebase provider.

## What's this for?

So you're writing your amazing new web application using Angular and Firebase. Because you're a good developer, you want to write unit tests that don't need to connect to a real Firebase instance to run correctly. So you need a mock for Firebase. Luckily, one already exists: [MockFirebase](https://github.com/katowulf/mockfirebase).

But how do you seamlessly switch between using MockFirebase in your tests, and real Firebase in production? Simple. Use Angular's own dependency injection (DI) framework.

## How's it work?

1. Include Fingular in your Javascript build.
2. Add the Fingular module to your own module's dependencies.
3. Configure Fingular either by using the provider object or by setting module values.

Now you can inject the $firebaseRef and $firebaseUser objects anywhere in Angular. $firebaseRef is a proxy for ```new Firebase(url);```, and $firebaseUser is a proxy for ```new FirebaseSimpleLogin(method, options);```.

## $firebaseRef

### Usage 

1. $firebaseRef takes care of the domain name part of the Firebase connection. All you have to supply is the key path, like so:

  ```javascript
  $firebaseRefProvider.domain('myinstance.firebaseio.com');
  ...
  $firebaseRef('/users/fred/favorites').push('Maria');
  ```

  This way you can easily change which Firebase instance your app points to for purposes of integration testing or migration.

2. Depending on configuration, $firebaseRef is either a proxy to Firebase or a mock object like MockFirebase. An example of how to do this is provided in examples/myApp.js and examples/myApp_test.js.

3. Although a function, $firebaseRef has three read-only properties for introspection:
  - ```protocol```: either ```http``` or ```https```.
  - ```domain```: the domain the firebaseRef points to.
  - ```mocked```: boolean. Tells whether the $firebaseRef is mocked out.

### Configuration

You can configure $firebaseRef either by setting values in your Angular module or by configuring $firebaseRefProvider. Settings on the provider override the values.

#### Values

- ```firebaseDomain```: the domain name of the Firebase instance to point to.
- ```firebaseProtocol```: Either ```http``` or ```https```. Defaults to https.
- ```firebaseMock```: a mock constructor to substitute for Firebase.
- ```firebaseMockData```: A plain old Javascript object that Fingular will interrogate and use to provision the Firebase mock object with data.

Example use:
```javascript
angular.module('myApp', ['fingular'])
.value('firebaseDomain', 'metropolis.firebaseio.com')
.value('firebaseProtocol', 'http') // Don't ever do this. Have you learned nothing, Fritz?
.value('firebaseMock', MockFirebase)
.value('firebaseMockData', {
  'users': {
    'fred': {
      'name': 'Freder Frederson',
      'hometown': 'Metropolis'
    }
  }
});
```

#### $firebaseRefProvider

- ```domain(domainName)```: the domain name of the Firebase instance to point to.
- ```protocol(protocolName)```: Either ```http``` or ```https```. Defaults to https.
- ```mockWith(constructorFunction)```: a mock constructor to substitute for Firebase.
- ```mockOut(keyPath, value)```: Have the mock Firebase object supply the given data for the given path. Currently only works with MockFirebase. (If you wish to use your own mock, ```value``` will be supplied as a second argument to the mock constructor function.

Example use:
```javascript
angular.module('myApp', ['fingular'])
.config(function($firebaseRefProvider) {
  $firebaseRefProvider
  .domain('test.firebaseio.com')
  .mockWith(MockFirebase)
  .mockOut('/users/fred', {
    name: 'Freder Frederson',
    hometown: 'Metropolis'
  });
});
```

## $firebaseUser

You can use $firebaseUser in place of FirebaseSimpleLogin to obtain some advantages vis-a-vis testing and some bonus Angular integration to boot.

### Usage

```javascript
angular.module('myModule', ['fingular'])
.controller('myController', function($firebaseUser, $rootScope) {
  if ($rootScope.firebaseUser.$anonymous) {
    console.log('Logging in...');
    $firebaseUser.login.then(function(user) {
      console.log('user logged in!');
      console.log(user);
    }, function(err) {
      console.error('login failed!');
      console.error(err);
    });
  } else {
    console.log($rootScope.firebaseUser);
    $rootScope.firebaseUserRef.on('value', function(userInfo) {
      console.log(userInfo.val());
    });
  }
});
```

### Configuration

You can configure $firebaseUser either by setting values in your Angular module or by configuring $firebaseUserProvider. Settings on the provider override the values.

#### Values

- ```firebaseUserMock```: The mock user constructor to substitute for FirebaseSingleLogin. Ordinarily you'll want to use MockFirebaseSimpleLogin.
- ```firebaseUserMockData```: user data to be handed to the mocking framework.
- ```firebaseUserCollectionPth(path)```: the absolute path to the collection of Firebase users in your Firebase. Defaults to /users, which you probably shouldn't change without good reason.

#### $firebaseUserProvider

- ```usersCollection(path)```: the absolute path to the collection of Firebase users in your Firebase. Defaults to /users, which you probably shouldn't change without good reason.
- ```mockWith(mockConstructor)```: The mock user constructor to substitute for FirebaseSingleLogin. Ordinarily you'll want to use MockFirebaseSimpleLogin.

Example use:
```javascript
angular.module('myApp', ['fingular'])
.config(function($firebaseRefProvider) {
  $firebaseRefProvider
  .domain('test.firebaseio.com')
  .mockWith(MockFirebase)
  .mockOut('/users/fred', {
    name: 'Freder Frederson',
    hometown: 'Metropolis'
  });
});


## Notes

Thanks to firebase-debug, on ```npm test``` you'll see this error:

> Error loading resource fingular/test/deps.js (203). Details: Error opening fingular/test/deps.js: No such file or directory

You can just ignore that.

## License

MIT
