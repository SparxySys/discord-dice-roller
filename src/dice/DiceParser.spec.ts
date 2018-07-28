import { expect } from 'chai';
import { FakeRandomProvider } from '../random/FakeRandomProvider.spec';
import { isPositive, parse } from './DiceParser';
import { DiceFunction, FunctionType } from './DiceFunction';
import { DiceExpression } from './DiceExpression';

const provider = new FakeRandomProvider();

describe('Parser', () => {
    describe('Errors', () => {
        it('Invalid expression', () => {
            const parseErr = () => {
                parse('d20 + nonexistent(d20)');
            };
            expect(parseErr).to.throw(Error, /Invalid expression/);
        });

        it('Invalid die size d1', () => {
            const parseErr = () => {
                parse('d1');
            };
            expect(parseErr).to.throw(Error, /Invalid die size/);
        });

        it('Invalid die size d0', () => {
            const parseErr = () => {
                parse('d0');
            };
            expect(parseErr).to.throw(Error, /Invalid die size/);
        });

        it('Invalid die size d1000000', () => {
            const parseErr = () => {
                parse('d1000000');
            };
            expect(parseErr).to.throw(Error, /Invalid die size/);
        });

        it('Invalid die size d1000001', () => {
            const parseErr = () => {
                parse('d1000001');
            };
            expect(parseErr).to.throw(Error, /Invalid die size/);
        });

        it('Invalid dice count 201', () => {
            const parseErr = () => {
                parse('201d20');
            };
            expect(parseErr).to.throw(Error, /Invalid dice count/);
        });

        it('Invalid dice count 202', () => {
            const parseErr = () => {
                parse('202d20');
            };
            expect(parseErr).to.throw(Error, /Invalid dice count/);
        });

        it('Invalid dice count 0', () => {
            const parseErr = () => {
                parse('0d20');
            };
            expect(parseErr).to.throw(Error, /Invalid dice count/);
        });
    });

    it('empty parse', () => {
        const result = parse('');
        const diceExpression = result.children[0] as DiceExpression;
        const expected = new DiceExpression(1, 20, true);
        const expectedParent = new DiceFunction(FunctionType.ADD, true);
        expectedParent.addChild(expected);
        expect(diceExpression).to.eql(expected);
    });

    it('Leaving out dicecount', () => {
        const result = parse('d20');
        const diceExpression = result.children[0] as DiceExpression;
        expect(diceExpression.diceCount).to.equal(1);
    });

    it('Parsing dicecount', () => {
        const result = parse('3d20');
        const diceExpression = result.children[0] as DiceExpression;
        expect(diceExpression.diceCount).to.equal(3);
    });

    it('Parsing diesize', () => {
        const result = parse('3d10');
        const diceExpression = result.children[0] as DiceExpression;
        expect(diceExpression.dieSize).to.equal(10);
    });

    it('Parsing name in DiceExpression', () => {
        const result = parse('3d10 this is a name ');
        const diceExpression = result.children[0] as DiceExpression;
        expect(diceExpression.name).to.equal('this is a name');
    });
});

describe('isPositive function', () => {
    it('explicit positive', () => {
        expect(isPositive('+')).to.be.true;
    });

    it('implicit positive', () => {
        expect(isPositive('')).to.be.true;
    });

    it('explicit negative', () => {
        expect(isPositive('-')).to.be.false;
    });

    it('invalid symbol', () => {
        const parseErr = () => {
            isPositive('n');
        };
        expect(parseErr).to.throw(Error, /Invalid symbol/);
    });
});

const variousExpressions = [
    {
        input: '',
        parsed: '1d20',
        result: '**11**',
    },
    {
        input: 'd20',
        parsed: '1d20',
        result: '**11**',
    },
    {
        input: '1d20',
        parsed: '1d20',
        result: '**11**',
    },
    {
        input: '+1d20',
        parsed: '1d20',
        result: '**11**',
    },
    {
        input: '3d8 cold + 1d6 bludgeoning dmg+3d4 piercing-1 STR mod',
        parsed: '3d8 cold + 1d6 bludgeoning dmg + 3d4 piercing - 1 STR mod',
        result: '**27** (**15** cold (5, 5, 5), **4** bludgeoning dmg, **9** piercing (3, 3, 3), **-1** STR mod)',
    },
    {
        input: '3d10-7+d4',
        parsed: '3d10 - 7 + 1d4',
        result: '**14** (**18** (6, 6, 6), **-7**, **3**)',
    },
    {
        input: '3d10 stuff name-7 some modifier+d4 guidance',
        parsed: '3d10 stuff name - 7 some modifier + 1d4 guidance',
        result: '**14** (**18** stuff name (6, 6, 6), **-7** some modifier, **3** guidance)',
    },
    {
        input: 'min(2d20)+7',
        parsed: 'min(2d20) + 7',
        result: '**18** (**11** (11, 11), **7**)',
    },
    {
        input: 'max(2d20)+7',
        parsed: 'max(2d20) + 7',
        result: '**18** (**11** (11, 11), **7**)',
    },
    {
        input: 'add(2d20)+7',
        parsed: '(2d20) + 7',
        result: '**29** (**22** (11, 11), **7**)',
    },
    {
        input: 'd20-max(2d20)',
        parsed: '1d20 - max(2d20)',
        result: '**0** (**11**, **-11** (11, 11))',
    },
    {
        input: 'd20+max(2d20)',
        parsed: '1d20 + max(2d20)',
        result: '**22** (**11**, **11** (11, 11))',
    },
    {
        input: '1d20 + min()',
        parsed: '1d20',
        result: '**11**',
    },
    /*,
    {
        "input": "3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance + max(2d20) advantage"
    },
    {
        "input": "3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance - max(2d20, 3d10) advantage"
    },
    {
        "input": "3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance"
    },
    {
        "input": "d20 - min(2d20) + 15"
    }*/
];

describe('Expression testing', () => {
    describe('parse', () => {
        variousExpressions.forEach((element) => {
            let text = element.input;
            if (text === '') {
                text = '<empty string>';
            }
            it(text, () => {
                const result = parse(element.input);
                expect(result.getChildrenString()).to.equal(element.parsed);
            });
        });
    });

    describe('result', () => {
        variousExpressions.forEach((element) => {
            let text = element.input;
            if (text === '') {
                text = '<empty string>';
            }
            it(text, () => {
                const result = parse(element.input);
                result.process(provider);
                expect(result.toResultString(' ')).to.equal(element.result);
            });
        });
    });
});
