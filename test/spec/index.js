
'use strict';

describe('the "fingular" module', function() {

  it('exists', function() {

    expect(function() {
      angular.mock.module('fingular');
    }).not.to.Throw();

  });

});
