import expect from 'expect.js';
import sinon from 'sinon';
import Migration from '../migration';
import {
  ES_API,
  formatTotalHits
} from '../../test_utils/helpers';

describe('migrations', function () {

  describe('Migration', function () {

    const client = {
      search: () => {},
      scroll: () => {},
      clearScroll: () => {},
      count:  () => {}
    };
    const configuration = {
      index:  'index',
      client: client
    };

    it('should check arguments at instantiation time', function () {
      expect(() => new Migration()).to.throwError();
      expect(() => new Migration(configuration)).not.to.throwError();
    });
    describe('countHits', function () {

      before(function () {
        sinon.stub(client, 'count');
      });

      it('should return 0 if index not present', async () => {
        const migration = new Migration(configuration);
        const index = 'index';
        const type = 'type';
        const query = {
          query: {
            match_all: {}
          }
        };
        client.count.returns({ status: 404 });

        const result = await migration.countHits(index, type, query);

        expect(result).to.be(0);
        expect(client.count.calledWith({
          index: index,
          type:  type,
          body:  query,
          ignore_unavailable: true,
          ignore: [404]
        }));
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
        client.count.returns({ count: 15 });

        const result = await migration.countHits(index, type, query);

        expect(result).to.be(15);
        expect(client.count.calledWith({
          index: index,
          type:  type,
          body:  query,
          ignore_unavailable: true,
          ignore: [404]
        }));
      });

      afterEach(function () {
        client.count.reset();
      });

      after(function () {
        client.count.restore();
      });
    });

    Object.keys(ES_API).forEach(version => {
      const esApi = ES_API[version];
      describe(`ES ${version}: scrollSearch`, function () {
        let search;
        let scroll;
        let clearScroll;

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

          clearScroll = sinon.stub(client, 'clearScroll').callsFake(() => ({ succeeded: true }));
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

          expect(clearScroll.callCount).to.be(1);
          expect(clearScroll.getCall(0).args[0]).to.eql({
            body: {
              scroll_id: `${esApi}_scroll_id`
            }
          });

          expect(results.length).to.be(100);
        });

        afterEach(() => {
          sinon.restore();
        });
      });
    });
  });

});
