var jsonutil = require('./kibiutils.js');
var expect = require('expect.js');

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

    jsonutil.goToElement(json, [ 'aaa', '0', 'bbb' ], function (nested) {
      if (nested === 'ccc') {
        ccc++;
      } else if (nested === 'ddd') {
        ddd++;
      }
    });
    expect(ccc).to.eql(1);
    expect(ddd).to.eql(0);

    jsonutil.goToElement(json, [ 'aaa', '1', 'bbb' ], function (nested) {
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
    jsonutil.goToElement(json, [ 'aaa', '0', 'ccc', 'eee' ], function (nested) {
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

    jsonutil.goToElement(json, [ 'aaa', 'bbb', '0' ], function (nested) {
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

    jsonutil.goToElement(json, [ 'aaa', '1', '0', 'bbb' ], function (nested) {
      if (nested === 'ccc') {
        ccc++;
      } else if (nested === 'ddd') {
        ddd++;
      }
    });
    expect(ccc).to.eql(1);
    expect(ddd).to.eql(0);

    jsonutil.goToElement(json, [ 'aaa', '1', '1', 'bbb' ], function (nested) {
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

      expect(jsonutil.goToElement).withArgs(json, [ 'aaa', 'bbb' ]).to.throwException(/unexpected json type/i);
    });

    it('bad path 2', function () {
      var json = {
        aaa: 'bbb'
      };

      expect(jsonutil.goToElement).withArgs(json, [ 'ccc' ]).to.throwException(/no property=\[ccc\]/i);
    });
  });
});

describe('uuid generation', function () {
  it('get uuid4', function () {
    var uuid4 = jsonutil.getUuid4();
    expect(uuid4).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});



