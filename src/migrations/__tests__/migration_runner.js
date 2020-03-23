import expect from 'expect.js';
import sinon from 'sinon';
import MigrationRunner from '../migration_runner';

describe('migrations', function () {

  describe('MigrationRunner', function () {

    /**
     * Fake migration class factory.
     *
     * @param description The description of the migration.
     * @param counts The number of objects reported by the migration for each pass.
     * @param upgrades The number of objects processed by the migration for each pass.
     * @param invalid If true, the constructor will throw an error.
     * @return a fake migration class.
     */
    function fakeMigrationClass(description, counts, upgrades, invalid) {

      return class Migration {

        constructor() {
          this.countCallNo = -1;
          this.upgradeCallNo = -1;
          this.description = description;
          if (invalid) throw new Error('invalid');
        }

        static get description() {
          return description;
        }

        async count() {
          this.countCallNo++;
          if (this.countCallNo >= 0 && this.countCallNo <= counts.length - 1) {
            return counts[this.countCallNo];
          } else {
            return 0;
          }
        }

        async upgrade() {
          this.upgradeCallNo++;
          if (this.upgradeCallNo >= 0 && this.upgradeCallNo <= upgrades.length - 1) {
            return upgrades[this.upgradeCallNo];
          } else {
            return 0;
          }
        }
      };
    }

    //Create a fake server having three plugins with fake migrations.
    const investigateCorePlugin = {
      status: {
        id: 'investigate_core'
      }
    };

    const plugin1 = {
      status: {
        id: 'plugin1'
      }
    };

    const plugin2 = {
      status: {
        id: 'plugin2'
      }
    };

    const plugin3 = {
      status: {
        id: 'plugin3'
      }
    };

    const plugin3callsNo2 = {
      status: {
        id: 'plugin3callsNo2'
      }
    };

    const plugin3callsNo6 = {
      status: {
        id: 'plugin3callsNo6'
      }
    };

    const server = {
      config: () => ({
        get: () => 'index'
      }),
      plugins: {
        elasticsearch: {
          getCluster() {
            return {
              getClient() {
                return {};
              }
            };
          }
        },
        plugin1: plugin1,
        plugin2: plugin2,
        plugin3: plugin3
      }
    };

    const kbnServer = {
      migrations: {
        plugin1: [ fakeMigrationClass('plugin1_1', [2], [2]),
          fakeMigrationClass('plugin1_2', [5], [5])],
        plugin2: [],
        plugin3: [fakeMigrationClass('plugin3_1', [3], [3])]
      }
    };

    const server2 = {
      config: () => ({
        get: () => 'index'
      }),
      plugins: {
        elasticsearch: {
          getCluster() {
            return {
              getClient() {
                return {};
              }
            };
          }
        },
        plugin1: plugin1,
        plugin2: plugin2,
        plugin3: plugin3callsNo2
      }
    };

    const kbnServer2 = {
      migrations: {
        plugin1: [ fakeMigrationClass('plugin1_1', [2], [2]),
          fakeMigrationClass('plugin1_2', [5], [5])],
        plugin2: [],
        plugin3: [
          fakeMigrationClass('plugin3_1', [3, 2], [3, 2]),
        ]
      }
    };

    const server3 = {
      config: () => ({
        get: () => 'index'
      }),
      plugins: {
        elasticsearch: {
          getCluster() {
            return {
              getClient() {
                return {};
              }
            };
          }
        },
        plugin3: plugin3callsNo6
      }
    };

    const kbnServer3 = {
      migrations: {
        plugin3: [fakeMigrationClass('plugin3_1', [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1])]
      }
    };

    const server4 = {
      config: () => ({
        get: () => 'index'
      }),
      plugins: {
        elasticsearch: {
          getCluster() {
            return {
              getClient() {
                return {};
              }
            };
          }
        },
        investigate_core: investigateCorePlugin,
        plugin1:          plugin1
      }
    };

    const kbnServer4 = {
      migrations: {
        plugin1:          [fakeMigrationClass('plugin1_1', [2], [2]), fakeMigrationClass('plugin1_2', [5], [5])],
        investigate_core: [fakeMigrationClass('investigate_core_1', [1], [1])]
      }
    };

    const logger = {
      info:    (e) => console.log('INFO', e),
      warning: (e) => console.log('WARN', e),
      error:   (e) => console.log('ERROR', e)
    };

    let infoSpy;
    let warningSpy;
    let errorSpy;

    beforeEach(function () {
      infoSpy = sinon.spy(logger, 'info');
      warningSpy = sinon.spy(logger, 'warning');
      errorSpy = sinon.spy(logger, 'error');
    });

    afterEach(function () {
      logger.info.restore();
      logger.warning.restore();
      logger.error.restore();
    });

    describe('getMigrations order', function () {
      const runner = new MigrationRunner(server4, logger, kbnServer4);

      it('migrations from investigate_core should be last', function () {
        const migrations = runner.getMigrations();
        expect(migrations.length).to.equal(3);
        expect(migrations[0].description).to.equal('plugin1_1');
        expect(migrations[1].description).to.equal('plugin1_2');
        expect(migrations[2].description).to.equal('investigate_core_1');
      });
    });

    describe('upgrade more than 5 passes', function () {
      const runner = new MigrationRunner(server3, logger, kbnServer3);

      it('should stop on 5th iteration', async () => {
        // there is one plugin which returns counts more than 5 times
        const result = await runner.upgrade();

        expect(result).to.be(5);
        sinon.assert.notCalled(warningSpy);
        sinon.assert.callCount(infoSpy, 6);
        expect(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
        expect(infoSpy.getCall(1).args[0]).to.equal('Iteration: 1\n1 objects - "plugin3_1"\n');
        expect(infoSpy.getCall(2).args[0]).to.equal('Iteration: 2\n1 objects - "plugin3_1"\n');
        expect(infoSpy.getCall(3).args[0]).to.equal('Iteration: 3\n1 objects - "plugin3_1"\n');
        expect(infoSpy.getCall(4).args[0]).to.equal('Iteration: 4\n1 objects - "plugin3_1"\n');
        expect(infoSpy.getCall(5).args[0]).to.equal('Iteration: 5\n1 objects - "plugin3_1"\n');
        sinon.assert.calledOnce(errorSpy);
        sinon.assert.calledWith(errorSpy, 'The upgrade procedure could not finish after 5 iterations');
      });
    });


    describe('upgrade 2 passes', function () {
      const runner = new MigrationRunner(server2, logger, kbnServer2);

      before(function () {
        sinon.spy(runner, 'getMigrations');
      });

      it('should execute second iteration if there are still migrations after the first one', async () => {
        // stub the third plugin so it returns 3 objects when called first time
        // and 2 objects when called second time
        const result = await runner.upgrade();
        expect(result).to.be(12);

        sinon.assert.notCalled(warningSpy);
        sinon.assert.notCalled(errorSpy);
        sinon.assert.callCount(infoSpy, 3);
        expect(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
        expect(infoSpy.getCall(1).args[0]).to.equal(
          'Iteration: 1\n2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n'
        );
        expect(infoSpy.getCall(2).args[0]).to.equal(
          'Iteration: 2\n2 objects - "plugin3_1"\n'
        );
      });

      after(function () {
        runner.getMigrations.restore();
      });

    });


    describe('upgrade', function () {
      const runner = new MigrationRunner(server, logger, kbnServer);

      before(function () {
        sinon.spy(runner, 'getMigrations');
      });

      it('should execute migrations in the correct order', async () => {
        const result = await runner.upgrade();

        expect(result).to.be(10);

        const migrations = await runner.getMigrations.returnValues[0];
        expect(migrations.length).to.be(3);
        const descriptions = migrations.map((migration) => migration.constructor.description);
        expect(descriptions).to.contain('plugin1_1');
        expect(descriptions).to.contain('plugin1_2');
        expect(descriptions).to.contain('plugin3_1');
        expect(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));
        sinon.assert.notCalled(warningSpy);
        sinon.assert.notCalled(errorSpy);
        sinon.assert.callCount(infoSpy, 2);
        expect(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
        expect(infoSpy.getCall(1).args[0]).to.equal(
          'Iteration: 1\n2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n'
        );
      });


      after(function () {
        runner.getMigrations.restore();
      });

    });

    describe('do not report zeros', function () {
      const plugin5 = {
        status: {
          id: 'plugin5'
        }
      };

      const server5 = {
        config: () => ({
          get: () => 'index'
        }),
        plugins: {
          elasticsearch: {
            getCluster() {
              return {
                getClient() {
                  return {};
                }
              };
            }
          },
          plugin5: plugin5
        }
      };

      const kbnServer = {
        migrations: {
          plugin5: [fakeMigrationClass('plugin5_1', [0], [0]), fakeMigrationClass('plugin5_2', [2], [2])]
        }
      };

      it('should not report 0 count in count phase', async () => {
        const runner = new MigrationRunner(server5, logger, kbnServer);
        const result = await runner.count();

        expect(result).to.be(2);

        sinon.assert.callCount(warningSpy, 1);
        expect(warningSpy.getCall(0).args[0]).to.equal(
          'The following migrations reported outdated objects:\n' +
          '2 objects - "plugin5_2"\n'
        );
      });

      it('should not report 0 count in upgrade phase', async () => {
        const runner = new MigrationRunner(server5, logger, kbnServer);
        const result = await runner.upgrade();

        expect(result).to.be(2);

        sinon.assert.notCalled(warningSpy);
        sinon.assert.notCalled(errorSpy);
        sinon.assert.callCount(infoSpy, 2);
        expect(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
        expect(infoSpy.getCall(1).args[0]).to.equal(
          'Iteration: 1\n2 objects - "plugin5_2"\n'
        );
      });

    });

    describe('count', function () {
      const runner = new MigrationRunner(server, logger, kbnServer);

      before(function () {
        sinon.spy(runner, 'getMigrations');
      });

      it('should execute migrations in the correct order', async () => {
        const result = await runner.count();

        expect(result).to.be(10);

        const migrations = await runner.getMigrations.returnValues[0];
        expect(migrations.length).to.be(3);
        const descriptions = migrations.map((migration) => migration.constructor.description);
        expect(descriptions).to.contain('plugin1_1');
        expect(descriptions).to.contain('plugin1_2');
        expect(descriptions).to.contain('plugin3_1');
        expect(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));
        sinon.assert.notCalled(infoSpy);
        sinon.assert.notCalled(errorSpy);
        sinon.assert.callCount(warningSpy, 1);
        expect(warningSpy.getCall(0).args[0]).to.equal(
          'The following migrations reported outdated objects:\n' +
          '2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n'
        );
      });

      after(function () {
        runner.getMigrations.restore();
      });

    });


    describe('getMigrations', function () {

      describe('should', function () {

        before(function () {
          sinon.spy(server.plugins.elasticsearch, 'getCluster');
        });

        it('cache migrations', async () => {
          const runner = new MigrationRunner(server, logger, kbnServer);
          runner.getMigrations();
          runner.getMigrations();

          expect(server.plugins.elasticsearch.getCluster.callCount).to.equal(3);
        });

        after(function () {
          server.plugins.elasticsearch.getCluster.restore();
        });

      });

      describe('should not', function () {

        it('swallow exceptions thrown by migration constructors', function () {
          const kbnServer = {
            migrations: {
              plugin1: [ fakeMigrationClass('plugin1_1', [2], [2]),
                fakeMigrationClass('plugin1_2', [5], [5])],
              plugin2: [fakeMigrationClass('err', [0], [0], true)],
              plugin3: [fakeMigrationClass('plugin3_1', [3], [3])]
            }
          };

          const runner = new MigrationRunner(server, logger, kbnServer);
          expect(() => runner.getMigrations()).to.throwError();
        });
      });

    });


  });

});
