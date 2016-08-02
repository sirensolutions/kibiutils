var kibiutils = require('./kibiutils.js');
var expect = require('expect.js');
var _ = require('lodash');

describe('Json traversing', function () {
  it('goToElement object in array', function () {
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


  it('goToElement object nested in array', function () {
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

  it('goToElement nested object', function () {
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

  it('goToElement nested arrays', function () {
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
    [
      'select * \n' +
       'from test \n' +
       '-- where name = \'@doc[_source][github_id]@\''
    ],
    [
      'select * \n' +
       'from test \n' +
        '/* where name \n' + '= \'@doc[_source][github_id]@\ */'
    ],
    [
      'select * \n' +
       'from test \n' +
       '# where name = \'@doc[_source][github_id]@\''
    ],
    [
      'select * \n' +
       'from test \n' +
        '/* where name \n' + '= \'@doc[_source] \n ' + '[github_id]@\ */'
    ]
  ];

  var DependentQueries = [
     'select * \n' +
       'from test \n' +
       ' where name = \'@doc[_source][github_id]@\''
    [
      'select * \n' +
       'from test \n' +
        'where name = \'@doc[_source][github_id]@\''
    ],
    [
      'select * \n' +
       'from test \n' +
        '- where name = \'@doc[_source][github_id]@\''
    ]
  ];

  it("Should check Queries for commented lines", function () {
  var queries = [];

    for (i = 0; i < notDependentQueries.length; i++) {
  var query = {
    activationQuery: "",
    resultQuery: ""
  };

      query.activationQuery = notDependentQueries[i].toString();
      query.resultQuery = notDependentQueries[i].toString();
      queries.push(query);
    }
    expect(kibiutils.doesQueryDependOnEntity(queries)).to.be(false);
  });

  it("Should check Queries for not commented lines", function () {
  var queries = [];

    for (i = 0; i < DependentQueries.length; i++) {
  var query = {
    activationQuery: "",
    resultQuery: ""
  };

      query.activationQuery = DependentQueries[i].toString();
      query.resultQuery = DependentQueries[i].toString();
      queries.push(query);
    }
    expect(kibiutils.doesQueryDependOnEntity(queries)).to.be(true);
  });

});
