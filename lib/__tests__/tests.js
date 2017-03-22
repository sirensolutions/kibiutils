'use strict';

var _kibiutils = require('../kibiutils.js');

var _kibiutils2 = _interopRequireDefault(_kibiutils);

var _expect = require('expect.js');

var _expect2 = _interopRequireDefault(_expect);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Json traversing', function () {
  describe('getValuesAtPath', function () {
    it('non existing path', function () {
      var values = _kibiutils2.default.getValuesAtPath({ aaa: 'bbb' }, ['not', 'in', 'there']);
      (0, _expect2.default)(values).to.have.length(0);
    });

    it('non existing path in nested object', function () {
      var json = {
        aaa: {
          bbb: 123
        }
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'ccc']);
      (0, _expect2.default)(values).to.have.length(0);
    });

    it('get value at level one', function () {
      var values = _kibiutils2.default.getValuesAtPath({ aaa: 'bbb' }, ['aaa']);
      (0, _expect2.default)(values).to.eql(['bbb']);
    });

    it('get nested value', function () {
      var json = {
        aaa: {
          bbb: 123
        }
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb']);
      (0, _expect2.default)(values).to.eql([123]);
    });

    it('value is an array', function () {
      var json = {
        aaa: [123, 456]
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa']);
      (0, _expect2.default)(values).to.eql([123, 456]);
    });

    it('nested value is an array', function () {
      var json = {
        aaa: {
          bbb: [123, 456]
        }
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb']);
      (0, _expect2.default)(values).to.eql([123, 456]);
    });

    it('multiple values are reachable via path', function () {
      var json = {
        aaa: [{
          bbb: 123
        }, {
          bbb: 456
        }]
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb']);
      (0, _expect2.default)(values).to.eql([123, 456]);
    });

    it('multiple values with some that are arrays are reachable via path', function () {
      var json = {
        aaa: [{
          bbb: [123, 456]
        }, {
          bbb: 789
        }]
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb']);
      (0, _expect2.default)(values).to.eql([123, 456, 789]);
    });

    it('nested array mix', function () {
      var json = {
        aaa: [{
          bbb: [{
            ccc: 123
          }, {
            ccc: 456
          }]
        }, {
          bbb: {
            ccc: 789
          }
        }]
      };
      var values = _kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb', 'ccc']);
      (0, _expect2.default)(values).to.eql([123, 456, 789]);
    });

    describe('nulls', function () {
      it('on level 1', function () {
        var json = {
          aaa: null
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa'])).to.have.length(0);
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb'])).to.have.length(0);
      });

      it('on level 2', function () {
        var json = {
          aaa: {
            bbb: null
          }
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb'])).to.have.length(0);
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb', 'ccc'])).to.have.length(0);
      });

      it('in array', function () {
        var json = {
          aaa: [123, null]
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa'])).to.eql([123]);
      });

      it('nested in array', function () {
        var json = {
          aaa: [{
            bbb: 123
          }, {
            bbb: null
          }]
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa', 'bbb'])).to.eql([123]);
      });
    });

    describe('dotted field names', function () {
      it('on level 1', function () {
        var json = {
          'aaa.bbb': 123
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa.bbb'])).to.eql([123]);
      });

      it('nested', function () {
        var json = {
          'aaa.bbb': {
            ccc: 123
          }
        };
        (0, _expect2.default)(_kibiutils2.default.getValuesAtPath(json, ['aaa.bbb', 'ccc'])).to.eql([123]);
      });
    });
  });

  describe('goToElement', function () {
    it('object in array', function () {
      var json = {
        aaa: [{
          bbb: 'ccc'
        }, {
          bbb: 'ddd'
        }]
      };

      var ccc = 0;
      var ddd = 0;

      _kibiutils2.default.goToElement(json, ['aaa', '0', 'bbb'], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      (0, _expect2.default)(ccc).to.eql(1);
      (0, _expect2.default)(ddd).to.eql(0);

      _kibiutils2.default.goToElement(json, ['aaa', '1', 'bbb'], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      (0, _expect2.default)(ccc).to.eql(1);
      (0, _expect2.default)(ddd).to.eql(1);
    });

    it('object nested in array', function () {
      var json = {
        aaa: [{
          ccc: {
            eee: 42
          }
        }]
      };
      _kibiutils2.default.goToElement(json, ['aaa', '0', 'ccc', 'eee'], function (nested) {
        (0, _expect2.default)(nested).to.eql(42);
      });
    });

    it('nested object', function () {
      var json = {
        aaa: {
          bbb: [{
            ccc: 'ccc'
          }]
        }
      };

      _kibiutils2.default.goToElement(json, ['aaa', 'bbb', '0'], function (nested) {
        (0, _expect2.default)(nested).to.eql({ ccc: 'ccc' });
      });
    });

    it('nested arrays', function () {
      var json = {
        aaa: ['foo', [{
          bbb: 'ccc'
        }, {
          bbb: 'ddd'
        }]]
      };

      var ccc = 0;
      var ddd = 0;

      _kibiutils2.default.goToElement(json, ['aaa', '1', '0', 'bbb'], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      (0, _expect2.default)(ccc).to.eql(1);
      (0, _expect2.default)(ddd).to.eql(0);

      _kibiutils2.default.goToElement(json, ['aaa', '1', '1', 'bbb'], function (nested) {
        if (nested === 'ccc') {
          ccc++;
        } else if (nested === 'ddd') {
          ddd++;
        }
      });
      (0, _expect2.default)(ccc).to.eql(1);
      (0, _expect2.default)(ddd).to.eql(1);
    });
  });
});

describe('Error handling', function () {
  describe('with goToElement', function () {
    it('bad path 1', function () {
      var json = {
        aaa: 'bbb'
      };

      (0, _expect2.default)(_kibiutils2.default.goToElement).withArgs(json, ['aaa', 'bbb']).to.throwException(/unexpected json type/i);
    });

    it('bad path 2', function () {
      var json = {
        aaa: 'bbb'
      };

      (0, _expect2.default)(_kibiutils2.default.goToElement).withArgs(json, ['ccc']).to.throwException(/no property=\[ccc\]/i);
    });
  });
});

describe('uuid generation', function () {
  it('get uuid4', function () {
    var uuid4 = _kibiutils2.default.getUuid4();
    (0, _expect2.default)(uuid4).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe('slugifyId()', function () {
  var fixtures = [['test#test', 'test-hash-test'], ['test/test', 'test-slash-test'], ['test?test', 'test-questionmark-test'], ['test=test', 'test-equal-test'], ['test&test', 'test-ampersand-test'], ['test / test', 'test-slash-test'], ['test ? test', 'test-questionmark-test'], ['test = test', 'test-equal-test'], ['test & test', 'test-ampersand-test'], ['test / ^test', 'test-slash-^test'], ['test ?  test', 'test-questionmark-test'], ['test =  test', 'test-equal-test'], ['test &  test', 'test-ampersand-test'], ['test/test/test', 'test-slash-test-slash-test'], ['test?test?test', 'test-questionmark-test-questionmark-test'], ['test&test&test', 'test-ampersand-test-ampersand-test'], ['test=test=test', 'test-equal-test-equal-test']];

  _lodash2.default.each(fixtures, function (fixture) {
    var msg = 'should convert ' + fixture[0] + ' to ' + fixture[1];
    it(msg, function () {
      var results = _kibiutils2.default.slugifyId(fixture[0]);
      (0, _expect2.default)(results).to.be(fixture[1]);
    });
  });

  it('should do nothing if the id is undefined', function () {
    (0, _expect2.default)(_kibiutils2.default.slugifyId(undefined)).to.be(undefined);
  });
});

describe('doesQueryDependOnEntity()', function () {
  var notDependentQueries = ['SELECT * \n' + 'FROM test \n' + '-- WHERE name = \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM test \n' + '/* WHERE name \n' + '= \'@doc[_source][github_id]@\' */', 'SELECT * \n' + 'FROM test \n' + '# WHERE name = \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM test \n' + '/* WHERE name \n' + '= \'@doc[_source] \n ' + '[github_id]@\ */', 'SELECT * \n' + 'FROM test \n' + 'WHERE name = 123 # \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM dbpedia: \n' + 'WHERE { \n' + '  ?s a \'Person\' # \'@doc[_source][github_id]@\' \n' + '}'];

  var dependentQueries = ['SELECT * \n' + 'FROM test \n' + 'WHERE name = \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM test \n' + '-- WHERE name = \'@doc[_source][github_id]@\' \n' + 'WHERE name = \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM test \n' + '/* WHERE name \n' + '= \'@doc[_source][github_id]@\' */ \n' + 'WHERE name = \'@doc[_source][github_id]@\'', 'SELECT * \n' + 'FROM dbpedia: \n' + 'WHERE { \n' + '  ?s a \'@doc[_source][github_id]@\' \n' + '}'];

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
    (0, _expect2.default)(_kibiutils2.default.doesQueryDependOnEntity(queries)).to.be(false);
  });

  it('should check queries for not commented lines on activationQuery', function () {
    for (var i = 0; i < dependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.activationQuery = dependentQueries[i];
      (0, _expect2.default)(_kibiutils2.default.doesQueryDependOnEntity([query])).to.be(true);
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
    (0, _expect2.default)(_kibiutils2.default.doesQueryDependOnEntity(queries)).to.be(false);
  });

  it('should check queries for not commented lines on resultQuery', function () {
    for (var i = 0; i < dependentQueries.length; i++) {
      var query = {
        activationQuery: '',
        resultQuery: ''
      };

      query.resultQuery = dependentQueries[i];
      (0, _expect2.default)(_kibiutils2.default.doesQueryDependOnEntity([query])).to.be(true);
    }
  });
});