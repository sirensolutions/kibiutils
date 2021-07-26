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
      bulk: () => {},
      search: () => {},
      scroll: () => {},
      clearScroll: () => {},
      count: () => ({ count: 15 })
    };
    const configuration = {
      index: 'index',
      client: client
    };

    afterEach(function () {
      sinon.restore();
    });

    it('should check arguments at instantiation time', function () {
      expect(() => new Migration()).to.throwError();
      expect(() => new Migration(configuration)).not.to.throwError();
    });

    describe('bulk', function () {

      let bulkSpy;

      beforeEach(function () {
        bulkSpy = sinon.spy(client, 'bulk');
      });

      it('should throw when incorrect bulk body detected - missing payload row', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 1;
        try {
          await migration.executeteBulkRequest([
            { index : { _index: '.siren', _id : '1' } },
            { index : { _index: '.siren', _id : '2' } },
            { field1 : 'value2' },
          ], batchOperationNumber);
          expect('Should throw').to.equal(false);
        } catch (error) {
          sinon.assert.notCalled(bulkSpy);
          expect(error.message).to.equal('Incorrect bulk body expected payload row at index 1 but got: {"index":{"_index":".siren","_id":"2"}}');
        }
      });

      it('should throw when incorrect bulk body detected - extra payload row', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 2;
        try {
          await migration.executeteBulkRequest([
            { index : { _index: '.siren', _id : '1' } },
            { field1 : 'value1' },
            { field1 : 'value7' },
            { index : { _index: '.siren', _id : '2' } },
            { field1 : 'value2' },
          ], batchOperationNumber);
          expect('Should throw').to.equal(false);
        } catch (error) {
          sinon.assert.notCalled(bulkSpy);
          expect(error.message).to.equal('Incorrect bulk body expected meta row at index 2 but got: {"field1":"value7"}');
        }
      });

      it('should throw when incorrect bulk body detected - missing payload at the end', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 2;
        try {
          await migration.executeteBulkRequest([
            { index : { _index: '.siren', _id : '1' } },
            { field1 : 'value1' },
            { index : { _index: '.siren', _id : '2' } }
          ], batchOperationNumber);
          expect('Should throw').to.equal(false);
        } catch (error) {
          sinon.assert.notCalled(bulkSpy);
          expect(error.message).to.equal('Incorrect bulk body expected additional payload row at index 3 but got nothing');
        }
      });

      it('should send bulk request in batches - index operations, opearationsNo=1', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 1;
        await migration.executeteBulkRequest([
          { index : { _index: '.siren', _id : '1' } },
          { field1 : 'value1' },
          { index : { _index: '.siren', _id : '2' } },
          { field1 : 'value2' },
        ], batchOperationNumber);

        sinon.assert.calledTwice(bulkSpy);
        expect(bulkSpy.getCall(0).args[0]).to.eql({
          refresh: true,
          body: [
            { index : { _index: '.siren', _id : '1' } },
            { field1 : 'value1' },
          ]
        });
        expect(bulkSpy.getCall(1).args[0]).to.eql({
          refresh: true,
          body: [
            { index : { _index: '.siren', _id : '2' } },
            { field1 : 'value2' },
          ]
        });
      });

      it('should send bulk request in batches - index operations, opearationsNo=2', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 2;
        await migration.executeteBulkRequest([
          { index : { _index: '.siren', _id : '1' } },
          { field1 : 'value1' },
          { index : { _index: '.siren', _id : '2' } },
          { field1 : 'value2' },
        ], batchOperationNumber);

        sinon.assert.calledOnce(bulkSpy);
        expect(bulkSpy.getCall(0).args[0]).to.eql({
          refresh: true,
          body: [
            { index : { _index: '.siren', _id : '1' } },
            { field1 : 'value1' },
            { index : { _index: '.siren', _id : '2' } },
            { field1 : 'value2' },
            ]
        });
      });

      it('should send bulk request in batches - mixed operations, opearationsNo=1', async () => {
        const migration = new Migration(configuration);
        const batchOperationNumber = 1;
        await migration.executeteBulkRequest([
          { index : { _index: '.siren', _id : '1' } },
          { field1 : 'value1' },
          { delete : { _index: '.siren', _id : '3' } },
          { index : { _index: '.siren', _id : '2' } },
          { field1 : 'value2' },
        ], batchOperationNumber);

        sinon.assert.calledThrice(bulkSpy);
        expect(bulkSpy.getCall(0).args[0]).to.eql({
          refresh: true,
          body: [
            { index : { _index: '.siren', _id : '1' } },
            { field1 : 'value1' },
          ]
        });
        expect(bulkSpy.getCall(1).args[0]).to.eql({
          refresh: true,
          body: [
            { delete : { _index: '.siren', _id : '3' } }
          ]
        });
        expect(bulkSpy.getCall(2).args[0]).to.eql({
          refresh: true,
          body: [
            { index : { _index: '.siren', _id : '2' } },
            { field1 : 'value2' },
          ]
        });
      });
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
          type: type,
          body: query
        }));
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
                hits: {
                  total: formatTotalHits(0, esApi),
                  hits: []
                }
              };
            }

            return {
              _scroll_id: `${esApi}_scroll_id`,
              hits: {
                total: formatTotalHits(100, esApi),
                hits: new Array(10)
              }
            };
          });

          scroll = sinon.stub(client, 'scroll').callsFake(function (scrollOptions) {
            return {
              _scroll_id: scrollOptions.body.scroll_id,
              hits: {
                total: formatTotalHits(100, esApi),
                hits: new Array(10)
              }
            };
          });

          clearScroll = sinon.stub(client, 'clearScroll').callsFake(() => ({ succeeded: true }));
        });


        describe('Call it as no emmiter', () => {

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
                index: index,
                type: type,
                scroll: '1m',
                size: options.size,
                body: query
              });

            expect(scroll.callCount).to.be(9);
            for (let i = 0; i < scroll.callCount; i++) {
              expect(scroll.getCall(i).args[0]).to.eql({
                body: {
                  scroll: '1m',
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

        });

        describe('Call it as emmiter', () => {

          it('should set default options if options have not been defined', async () => {
            const migration = new Migration(configuration);
            const emitter = await migration.scrollSearch('empty', 'type', {}, undefined, true);
            return new Promise((resolve, reject) => {
              emitter.on('end', () => {
                sinon.assert.calledOnce(search);
                sinon.assert.alwaysCalledWith(search, sinon.match({ size: 100 }));
                emitter.removeAllListeners();
                resolve()
              });
              emitter.on('error', (error) => {
                emitter.removeAllListeners();
                reject(error)
              });
            });
          });

          it('should set a default size if no size has been specified', async () => {
            const migration = new Migration(configuration);
            const emitter = await migration.scrollSearch('empty', 'type', {}, {}, true);
            return new Promise((resolve, reject) => {
              emitter.on('end', () => {
                sinon.assert.calledOnce(search);
                sinon.assert.alwaysCalledWith(search, sinon.match({ size: 100 }));
                emitter.removeAllListeners();
                resolve()
              });
              emitter.on('error', (error) => {
                emitter.removeAllListeners();
                reject(error)
              });
            });
          });

          it('should use the specified size', async () => {
            const migration = new Migration(configuration);
            const emitter = await migration.scrollSearch('empty', 'type', {}, { size: 1000 }, true);
            return new Promise((resolve, reject) => {
              emitter.on('end', () => {
                sinon.assert.calledOnce(search);
                sinon.assert.alwaysCalledWith(search, sinon.match({ size: 1000 }));
                emitter.removeAllListeners();
                resolve()
              });
              emitter.on('error', (error) => {
                emitter.removeAllListeners();
                reject(error)
              });
            });
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

            const emitter = await migration.scrollSearch(index, type, query, options, true);
            return new Promise((resolve, reject) => {
              let dataEventsNo = 0;
              let totalEmittedObjects = 0;

              emitter.on('data', (data) => {
                dataEventsNo++;
                totalEmittedObjects += data.length;
              });

              emitter.on('end', (res) => {
                sinon.assert.calledOnce(search);
                sinon.assert.alwaysCalledWith(search,
                  {
                    index: index,
                    type: type,
                    scroll: '1m',
                    size: options.size,
                    body: query
                  });

                expect(scroll.callCount).to.be(9);
                for (let i = 0; i < scroll.callCount; i++) {
                  expect(scroll.getCall(i).args[0]).to.eql({
                    body: {
                      scroll: '1m',
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

                expect(totalEmittedObjects).to.be(100);
                expect(dataEventsNo).to.be(10);
                emitter.removeAllListeners();
                resolve()
              });
              emitter.on('error', (error) => {
                emitter.removeAllListeners();
                reject(error)
              });
            });
          });
        });
      });
    });
  });

});
