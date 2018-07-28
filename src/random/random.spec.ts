import { expect } from 'chai';
import { DefaultRandomProvider } from './random';

const dieSizeToTest = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 100];
const defaultProvider = new DefaultRandomProvider();

describe('default random provider', () => {
    describe('with lower bound', () => {
        dieSizeToTest.forEach((element) => {
            describe('die size: ' + element, () => {
                const results = [];
                for (let i = 0; i < 1000 * element; i++) {
                  const rand = defaultProvider.getRandomWithMin(1, element);
                  if (typeof results[rand] === 'undefined') {
                    results[rand] = 0;
                  }
                  results[rand] = results[rand] + 1;
                }

                for (let i = 1; i <= element; i++) {
                    it('checking if ' + i + ' was rolled', () => {
                        expect(results[i]).to.greaterThan(0);
                    });
                }
                it('checking if 0 was not rolled', () => {
                    expect(results[0]).to.be.an('undefined');
                });
                it('checking if ' + String(element + 1) + ' was not rolled', () => {
                    expect(results[element + 1]).to.be.an('undefined');
                });
            });
        });
    });

    describe('without lower bound', () => {
        dieSizeToTest.forEach((element) => {
            describe('die size: ' + element, () => {
                const results = [];
                for (let i = 0; i < 1000 * element; i++) {
                const rand = defaultProvider.getRandom(element);
                if (typeof results[rand] === 'undefined') {
                    results[rand] = 0;
                }
                results[rand] = results[rand] + 1;
                }

                for (let i = 1; i <= element; i++) {
                    it('checking if ' + i + ' was rolled', () => {
                        expect(results[i]).to.greaterThan(0);
                    });
                }
                it('checking if 0 was not rolled', () => {
                    expect(results[0]).to.be.an('undefined');
                });
                it('checking if ' + String(element + 1) + ' was not rolled', () => {
                    expect(results[element + 1]).to.be.an('undefined');
                });
            });
        });
    });
});
