import expect from 'expect.js';
import sinon from 'sinon';
import SimpleMigration from '../simple_migration';
import {
  ES_API,
  formatTotalHits
} from '../../test_utils/helpers';

const DEFAULT_TYPE = 'doc';

describe('migrations', function () {
  const KIBANA_INDEX = '.siren';
  const config = {
    get: () => KIBANA_INDEX
  };
  const client = {
    search: () => {},
    clearScroll: () => {},
    scroll: () => {}
  };
  const configuration = {
    index: 'index',
    client,
    config
  };
  const _index = 'index-name';
  const _type = '_doc';
  const savedObjectType = 'savedObjectType';
  const dummySavedObject = Object.freeze({
    _index,
    _type,
    _id:     'jnvckemkcekrmc',
    _source: {
      type:              savedObjectType,
      [savedObjectType]: {
        version: 2
      }
    }
  });
  describe('SimpleMigration', function () {
    describe('Throws exception if', () => {
      const invalidSimpleMigration = new SimpleMigration(configuration);
      it('newVersion not defined', () => {
        try {
          invalidSimpleMigration.newVersion;
        } catch (e) {
          return;
        }
        expect().fail('Exception not thrown!');
      });
      it('_savedObjectType and _searchQuery not defined', () => {
        try {
          invalidSimpleMigration._getSearchParams();
        } catch (e) {
          return;
        }
        expect().fail('Exception not thrown!');
      });
      it('_shouldObjectUpgrade not implemented', async () => {
        try {
          await invalidSimpleMigration._shouldObjectUpgrade(dummySavedObject);
        } catch (e) {
          return;
        }
        expect().fail('Exception not thrown!');
      });
      it('_upgradeObject not implemented', async () => {
        try {
          await invalidSimpleMigration._upgradeObject(dummySavedObject);
        } catch (e) {
          return;
        }
        expect().fail('Exception not thrown!');
      });
    });

    describe('_getSearchParams', () => {
      let simpleMigration;
      beforeEach(() => {
        simpleMigration = new SimpleMigration(configuration);
      });
      it('throws exception if both _savedObjectType and _savedObjectType defined', () => {
        simpleMigration._savedObjectType = savedObjectType;
        simpleMigration._searchQuery = 'query';
        expect(() => simpleMigration._getSearchParams()).to.throwError();
      });
      describe('_savedObjectType', () => {
        beforeEach(() => {
          simpleMigration._savedObjectType = savedObjectType;
        });
        it('returns correct params', () => {
          expect(simpleMigration._getSearchParams()).to.eql({
            index: KIBANA_INDEX,
            type:  DEFAULT_TYPE,
            query: {
              query: {
                match: {
                  type: savedObjectType
                }
              }
            }
          });
        });
        it('custom _index, _type works', () => {
          simpleMigration._index = 'custom-index';
          simpleMigration._type = 'custom-type';
          expect(simpleMigration._getSearchParams()).to.eql({
            index: 'custom-index',
            type:  'custom-type',
            query: {
              query: {
                match: {
                  type: savedObjectType
                }
              }
            }
          });
        });
      });
      describe('_searchQuery', () => {
        const query = Object.freeze({
          query: {
            match: {
              field: 'value'
            }
          }
        });
        beforeEach(() => {
          simpleMigration._searchQuery = query;
        });
        it('returns correct params', () => {
          expect(simpleMigration._getSearchParams()).to.eql({
            index: KIBANA_INDEX,
            type:  DEFAULT_TYPE,
            query
          });
        });
        it('custom _index, _type works', () => {
          simpleMigration._index = 'custom-index';
          simpleMigration._type = 'custom-type';
          expect(simpleMigration._getSearchParams()).to.eql({
            index: 'custom-index',
            type:  'custom-type',
            query
          });
        });
      });
    });

    Object.keys(ES_API).forEach(version => {
      const esApi = ES_API[version];
      describe(`ES ${version}: If count: 0`, () => {
        let search;
        const simpleMigration = new SimpleMigration(configuration);
        const _shouldObjectUpgradeSpy = sinon.spy(simpleMigration, '_shouldObjectUpgrade');
        const _upgradeObjectSpy = sinon.spy(simpleMigration, '_upgradeObject');
        simpleMigration._savedObjectType = savedObjectType;
        beforeEach(() => {
          search = sinon.stub(client, 'search').callsFake(function () {
            return {
              _scroll_id: `${esApi}_scroll_id`,
              hits:       {
                total: formatTotalHits(0, esApi),
                hits:  []
              }
            };
          });
        });
        afterEach(() => {
          search.restore();
          _shouldObjectUpgradeSpy.resetHistory();
          _upgradeObjectSpy.resetHistory();
        });
        it('_shouldObjectUpgrade not called', async () => {
          const count = await simpleMigration.count();
          expect(count).to.be(0);
          sinon.assert.notCalled(_shouldObjectUpgradeSpy);
        });
        it('_upgradeObject not called', async () => {
          const count = await simpleMigration.upgrade();
          expect(count).to.be(0);
          sinon.assert.notCalled(_upgradeObjectSpy);
        });
      });

      describe(`ES ${version}: If object version > newVersion`, () => {
        let search;
        const simpleMigration = new SimpleMigration(configuration);
        simpleMigration._newVersion = 1;
        const _shouldObjectUpgradeSpy = sinon.spy(simpleMigration, '_shouldObjectUpgrade');
        const _upgradeObjectSpy = sinon.spy(simpleMigration, '_upgradeObject');
        simpleMigration._savedObjectType = savedObjectType;
        beforeEach(() => {
          search = sinon.stub(client, 'search').callsFake(function () {
            return {
              _scroll_id: `${esApi}_scroll_id`,
              hits:       {
                total: formatTotalHits(1, esApi),
                hits:  [dummySavedObject]
              }
            };
          });
        });
        afterEach(() => {
          search.restore();
          _shouldObjectUpgradeSpy.resetHistory();
          _upgradeObjectSpy.resetHistory();
        });
        it('_shouldObjectUpgrade not called', async () => {
          const count = await simpleMigration.count();
          expect(count).to.be(0);
          sinon.assert.notCalled(_shouldObjectUpgradeSpy);
        });
        it('_upgradeObject not called', async () => {
          const count = await simpleMigration.upgrade();
          expect(count).to.be(0);
          sinon.assert.notCalled(_upgradeObjectSpy);
        });
      });
    });
  });

});
