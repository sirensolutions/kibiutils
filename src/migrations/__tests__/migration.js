import expect from 'expect.js';
import sinon from 'sinon';
import Migration from '../migration';

describe('migrations', function () {

  describe('Migration', function () {

    const ES_API = Object.freeze({
      v5_x: '5_x',
      v7_x: '7_x'
    });

    const client = {
      search: () => {},
      scroll: () => {},
      count:  () => ({ count: 15 })
    };
    const configuration = {
      index:  'index',
      client: client
    };

    function formatTotalHits(value, format) {
      switch (format) {
        case ES_API.v5_x:
          return value;
        case ES_API.v7_x:
          return {
            value,
            relation: 'eq'
          };
        default:
          return value;
      }
    }

    it('should check arguments at instantiation time', function () {
      expect(() => new Migration()).to.throwError();
      expect(() => new Migration(configuration)).not.to.throwError();
    });
    describe('countHits', function () {

      beforeEach(function () {
        sinon.spy(client, 'count');
      });

      it('should build the correct query and return the result', async () => {
        const migration = new Migration(configuration);
        const index = 'index';
        const type = 'type';
        const query = {
          query: {
            match_all: {}
          }
        };

        const result = await migration.countHits(index, type, query);

        expect(result).to.be(15);
        expect(client.count.calledWith({
          index: index,
          type:  type,
          body:  query
        }));
      });

      afterEach(function () {
        client.count.restore();
      });

    });

    Object.keys(ES_API).forEach(version => {
      const esApi = ES_API[version];
      describe(`ES ${version}: scrollSearch`, function () {
        let search;
        let scroll;

        beforeEach(function () {
          search = sinon.stub(client, 'search').callsFake(function (searchOptions) {
            if (searchOptions.index === 'empty') {
              return {
                _scroll_id: `${esApi}_scroll_id`,
                hits:       {
                  total: formatTotalHits(0, esApi),
                  hits:  []
                }
              };
            }

            return {
              _scroll_id: `${esApi}_scroll_id`,
              hits:       {
                total: formatTotalHits(100, esApi),
                hits:  new Array(10)
              }
            };
          });

          scroll = sinon.stub(client, 'scroll').callsFake(function (scrollOptions) {
            return {
              _scroll_id: scrollOptions.body.scroll_id,
              hits:       {
                total: formatTotalHits(100, esApi),
                hits:  new Array(10)
              }
            };
          });
        });

        it('should set default options if options have not been defined', async () => {
          const migration = new Migration(configuration);
          await migration.scrollSearch('empty', 'type', {});

          sinon.assert.calledOnce(search);
          sinon.assert.alwaysCalledWith(search, sinon.match({ size: 100 }));
        });

        it('should set a default size if no size has been specified', async () => {
          const migration = new Migration(configuration);
          await migration.scrollSearch('empty', 'type', {}, {});

          sinon.assert.calledOnce(search);
          sinon.assert.alwaysCalledWith(search, sinon.match({ size: 100 }));
        });

        it('should use the specified size', async () => {
          const migration = new Migration(configuration);
          await migration.scrollSearch('empty', 'type', {}, { size: 1000 });

          sinon.assert.calledOnce(search);
          sinon.assert.alwaysCalledWith(search, sinon.match({ size: 1000 }));
        });

        it('should use the scroll API to fetch hits', async () => {
          const migration = new Migration(configuration);
          const index = 'index';
          const type = 'type';
          const query = {
            query: {
              match_all: {}
            }
          };
          const options = {
            size: 10
          };

          const results = await migration.scrollSearch(index, type, query, options);

          sinon.assert.calledOnce(search);
          sinon.assert.alwaysCalledWith(search,
            {
              index:  index,
              type:   type,
              scroll: '1m',
              size:   options.size,
              body:   query
            });

          expect(scroll.callCount).to.be(9);
          for (let i = 0; i < scroll.callCount; i++) {
            expect(scroll.getCall(i).args[0]).to.eql({
              body: {
                scroll:    '1m',
                scroll_id: `${esApi}_scroll_id`
              }
            });
          }

          expect(results.length).to.be(100);
        });

        afterEach(() => {
          search.restore();
          scroll.restore();
        });
      });
    });
  });

});
