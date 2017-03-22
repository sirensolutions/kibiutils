import kibiutils from '../kibiutils.js';
import expect from 'expect.js';
import _ from 'lodash';

describe('Json traversing', function () {
  describe('getValuesAtPath', function () {
    it('non existing path', function () {
      var values = kibiutils.getValuesAtPath({ aaa: 'bbb' }, [ 'not', 'in', 'there' ]);
      expect(values).to.have.length(0);
    });

    it('non existing path in nested object', function () {
      var json = {
        aaa: {
          bbb: 123
        }
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'ccc' ]);
      expect(values).to.have.length(0);
    });

    it('get value at level one', function () {
      var values = kibiutils.getValuesAtPath({ aaa: 'bbb' }, [ 'aaa' ]);
      expect(values).to.eql([ 'bbb' ]);
    });

    it('get nested value', function () {
      var json = {
        aaa: {
          bbb: 123
        }
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ]);
      expect(values).to.eql([ 123 ]);
    });

    it('value is an array', function () {
      var json = {
        aaa: [ 123, 456 ]
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa' ]);
      expect(values).to.eql([ 123, 456 ]);
    });

    it('nested value is an array', function () {
      var json = {
        aaa: {
          bbb: [ 123, 456 ]
        }
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ]);
      expect(values).to.eql([ 123, 456 ]);
    });

    it('multiple values are reachable via path', function () {
      var json = {
        aaa: [
          {
            bbb: 123
          },
          {
            bbb: 456
          }
        ]
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ]);
      expect(values).to.eql([ 123, 456 ]);
    });

    it('multiple values with some that are arrays are reachable via path', function () {
      var json = {
        aaa: [
          {
            bbb: [ 123, 456 ]
          },
          {
            bbb: 789
          }
        ]
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ]);
      expect(values).to.eql([ 123, 456, 789 ]);
    });

    it('nested array mix', function () {
      var json = {
        aaa: [
          {
            bbb: [
              {
                ccc: 123
              },
              {
                ccc: 456
              }
            ]
          },
          {
            bbb: {
              ccc: 789
            }
          }
        ]
      };
      var values = kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb', 'ccc' ]);
      expect(values).to.eql([ 123, 456, 789 ]);
    });

    describe('nulls', function () {
      it('on level 1', function () {
        var json = {
          aaa: null
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa' ])).to.have.length(0);
        expect(kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ])).to.have.length(0);
      });

      it('on level 2', function () {
        var json = {
          aaa: {
            bbb: null
          }
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ])).to.have.length(0);
        expect(kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb', 'ccc' ])).to.have.length(0);
      });

      it('in array', function () {
        var json = {
          aaa: [
            123,
            null
          ]
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa' ])).to.eql([ 123 ]);
      });

      it('nested in array', function () {
        var json = {
          aaa: [
            {
              bbb: 123
            },
            {
              bbb: null
            }
          ]
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa', 'bbb' ])).to.eql([ 123 ]);
      });
    });

    describe('dotted field names', function () {
      it('on level 1', function () {
        var json = {
          'aaa.bbb': 123
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa.bbb' ])).to.eql([ 123 ]);
      });

      it('nested', function () {
        var json = {
          'aaa.bbb': {
            ccc: 123
          }
        };
        expect(kibiutils.getValuesAtPath(json, [ 'aaa.bbb', 'ccc' ])).to.eql([ 123 ]);
      });
    });
  });

  describe('goToElement', function () {
    it('object in array', function () {
      var json = {
        aaa: [
          {
            bbb: 'ccc'
          },
          {
            bbb: 'ddd'
          }
        ]
      };

      var ccc = 0;
      var ddd = 0;

      kibiutils.goToElement(json, [ 'aaa', '0', 'bbb' ], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      expect(ccc).to.eql(1);
      expect(ddd).to.eql(0);

      kibiutils.goToElement(json, [ 'aaa', '1', 'bbb' ], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      expect(ccc).to.eql(1);
      expect(ddd).to.eql(1);
    });

    it('object nested in array', function () {
      var json = {
        aaa: [
          {
            ccc: {
              eee: 42
            }
          }
        ]
      };
      kibiutils.goToElement(json, [ 'aaa', '0', 'ccc', 'eee' ], function (nested) {
        expect(nested).to.eql(42);
      });
    });

    it('nested object', function () {
      var json = {
        aaa: {
          bbb: [
            {
              ccc: 'ccc'
            }
          ]
        }
      };

      kibiutils.goToElement(json, [ 'aaa', 'bbb', '0' ], function (nested) {
        expect(nested).to.eql({ ccc: 'ccc' });
      });
    });

    it('nested arrays', function () {
      var json = {
        aaa: [
          'foo',
          [
            {
              bbb: 'ccc'
            },
            {
              bbb: 'ddd'
            }
          ]
        ]
      };

      var ccc = 0;
      var ddd = 0;

      kibiutils.goToElement(json, [ 'aaa', '1', '0', 'bbb' ], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      expect(ccc).to.eql(1);
      expect(ddd).to.eql(0);

      kibiutils.goToElement(json, [ 'aaa', '1', '1', 'bbb' ], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      expect(ccc).to.eql(1);
      expect(ddd).to.eql(1);
    });
  });
});

describe('Error handling', function () {
  describe('with goToElement', function () {
    it('bad path 1', function () {
      var json = {
        aaa: 'bbb'
      };

      expect(kibiutils.goToElement).withArgs(json, [ 'aaa', 'bbb' ]).to.throwException(/unexpected json type/i);
    });

    it('bad path 2', function () {
      var json = {
        aaa: 'bbb'
      };

      expect(kibiutils.goToElement).withArgs(json, [ 'ccc' ]).to.throwException(/no property=\[ccc\]/i);
    });
  });
});

describe('uuid generation', function () {
  it('get uuid4', function () {
    var uuid4 = kibiutils.getUuid4();
    expect(uuid4).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe('slugifyId()', function () {
  var fixtures = [
    ['test#test', 'test-hash-test'],
    ['test/test', 'test-slash-test'],
    ['test?test', 'test-questionmark-test'],
    ['test=test', 'test-equal-test'],
    ['test&test', 'test-ampersand-test'],
    ['test / test', 'test-slash-test'],
    ['test ? test', 'test-questionmark-test'],
    ['test = test', 'test-equal-test'],
    ['test & test', 'test-ampersand-test'],
    ['test / ^test', 'test-slash-^test'],
    ['test ?  test', 'test-questionmark-test'],
    ['test =  test', 'test-equal-test'],
    ['test &  test', 'test-ampersand-test'],
    ['test/test/test', 'test-slash-test-slash-test'],
    ['test?test?test', 'test-questionmark-test-questionmark-test'],
    ['test&test&test', 'test-ampersand-test-ampersand-test'],
    ['test=test=test', 'test-equal-test-equal-test']
  ];

  _.each(fixtures, function (fixture) {
    var msg = 'should convert ' + fixture[0] + ' to ' + fixture[1];
    it(msg, function () {
      var results = kibiutils.slugifyId(fixture[0]);
      expect(results).to.be(fixture[1]);
    });
  });

  it('should do nothing if the id is undefined', function () {
    expect(kibiutils.slugifyId(undefined)).to.be(undefined);
  });
});

describe('doesQueryDependOnEntity()', function () {
  var notDependentQueries = [
    'SELECT * \n' +
    'FROM test \n' +
    '-- WHERE name = \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM test \n' +
    '/* WHERE name \n' +
    '= \'@doc[_source][github_id]@\' */',

    'SELECT * \n' +
    'FROM test \n' +
    '# WHERE name = \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM test \n' +
    '/* WHERE name \n' +
    '= \'@doc[_source] \n ' +
    '[github_id]@\ */',

    'SELECT * \n' +
    'FROM test \n' +
    'WHERE name = 123 # \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM dbpedia: \n' +
    'WHERE { \n' +
    '  ?s a \'Person\' # \'@doc[_source][github_id]@\' \n' +
    '}'
  ];

  var dependentQueries = [
    'SELECT * \n' +
    'FROM test \n' +
    'WHERE name = \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM test \n' +
    '-- WHERE name = \'@doc[_source][github_id]@\' \n' +
    'WHERE name = \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM test \n' +
    '/* WHERE name \n' + '= \'@doc[_source][github_id]@\' */ \n' +
    'WHERE name = \'@doc[_source][github_id]@\'',

    'SELECT * \n' +
    'FROM dbpedia: \n' +
    'WHERE { \n' +
    '  ?s a \'@doc[_source][github_id]@\' \n' +
    '}'
  ];

  it('should check queries for commented lines on activationQuery', function () {
    var queries = [];

    for (var i = 0; i < notDependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.activationQuery = notDependentQueries[i];
      queries.push(query);
    }
    expect(kibiutils.doesQueryDependOnEntity(queries)).to.be(false);
  });

  it('should check queries for not commented lines on activationQuery', function () {
    for (var i = 0; i < dependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.activationQuery = dependentQueries[i];
      expect(kibiutils.doesQueryDependOnEntity([ query ])).to.be(true);
    }
  });

  it('should check queries for commented lines on resultQuery', function () {
    var queries = [];

    for (var i = 0; i < notDependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.resultQuery = notDependentQueries[i];
      queries.push(query);
    }
    expect(kibiutils.doesQueryDependOnEntity(queries)).to.be(false);
  });

  it('should check queries for not commented lines on resultQuery', function () {
    for (var i = 0; i < dependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.resultQuery = dependentQueries[i];
      expect(kibiutils.doesQueryDependOnEntity([ query ])).to.be(true);
    }
  });
});
