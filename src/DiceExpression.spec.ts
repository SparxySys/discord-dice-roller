import { DiceExpression, DiceFunction, FunctionType, Absolute, parse, isPositive } from './DiceExpression';
import { expect } from 'chai';
import { RandomProvider } from './random';

class FakeRandomProvider implements RandomProvider {
    getRandom(max: number): number {
        return this.getRandomWithMin(1, max);
    }

    getRandomWithMin(min: number, max: number): number {
        // gets average roll, rounded up
        return (Math.ceil((max-min)/2)) + min;
    }
}

const provider = new FakeRandomProvider();

describe('DiceExpression', () => {
    it('basic toString', () => {
        const result: DiceExpression = new DiceExpression(1, 20);
        const resultText = result.toString(true);
        expect(resultText).to.equal('1d20');
    });

    it('basic non-first toString', () => {
        const result: DiceExpression = new DiceExpression(1, 20);
        const resultText = result.toString(false);
        expect(resultText).to.equal(' + 1d20');
    });

    it('toString with negative', () => {
        const result: DiceExpression = new DiceExpression(5, 10, false);
        const resultText = result.toString(true);
        expect(resultText).to.equal(' - 5d10');
    });

    it('toString with name', () => {
        const result: DiceExpression = new DiceExpression(2, 6, true, 'damage');
        const resultText = result.toString(true);
        expect(resultText).to.equal('2d6 damage');
    });

    it('toString with negative and name', () => {
        const result: DiceExpression = new DiceExpression(2, 4, false, 'damage');
        const resultText = result.toString(true);
        expect(resultText).to.equal(' - 2d4 damage');
    });

    it('d20', () => {
        const result: DiceExpression = new DiceExpression(1, 20);
        result.process(provider);
        expect(result.value).to.equal(11);
    });

    it('- d20', () => {
        const result: DiceExpression = new DiceExpression(1, 20, false);
        result.process(provider);
        expect(result.value).to.equal(-11);
    });

    it('3d8', () => {
        const addition: DiceFunction = new DiceFunction(FunctionType.ADD, true);
        const result: DiceExpression = new DiceExpression(3, 8);
        addition.addChild(result);
        result.process(provider);
        expect(result.value).to.equal(15);
    });

    it('- 3d8', () => {
        const addition: DiceFunction = new DiceFunction(FunctionType.ADD, true);
        const result: DiceExpression = new DiceExpression(3, 8, false);
        addition.addChild(result);
        result.process(provider);
        expect(result.value).to.equal(-15);
    });
});

describe('DiceFunction', () => {
    it('min of 10 and 20', () => {
        const func = new DiceFunction(FunctionType.MIN, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        func.process(provider);
        expect(func.value).to.equal(10);
    });

    it('min of 10 and 20 toString', () => {
        const func = new DiceFunction(FunctionType.MIN, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        expect(func.toString(true)).to.equal("min(10, 20)");
    });

    it('min of 10 and 20 toString non-first', () => {
        const func = new DiceFunction(FunctionType.MIN, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        expect(func.toString(false)).to.equal(" + min(10, 20)");
    });

    it('min of 10 and 20 toString negative', () => {
        const func = new DiceFunction(FunctionType.MIN, false);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        expect(func.toString(false)).to.equal(" - min(10, 20)");
    });
    
    it('max of 10 and 20', () => {
        const func = new DiceFunction(FunctionType.MAX, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        func.process(provider);
        expect(func.value).to.equal(20);
    });

    it('addition of 10 and 20', () => {
        const func = new DiceFunction(FunctionType.ADD, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20));
        func.process(provider);
        expect(func.value).to.equal(30);
    });

    it('addition of 10 and -20', () => {
        const func = new DiceFunction(FunctionType.ADD, true);
        func.addChild(new Absolute(10));
        func.addChild(new Absolute(20, false));
        func.process(provider);
        expect(func.value).to.equal(-10);
    });

    it('invalid DiceFunction type', () => {
        const parseErr = () => {
            const func = new DiceFunction(FunctionType.DICE, true);
            func.process(provider);
        };
        expect(parseErr).to.throw(Error, /Unimplemented function type/);
    });
});

describe('Absolute', () => {
    it('positive number', () => {
        const abs = new Absolute(8);
        abs.process(provider);
        expect(abs.value).to.equal(8);
    });

    it('number with name', () => {
        const abs = new Absolute(8, true, 'some modifier');
        abs.process(provider);
        expect(abs.toString(true)).to.equal('8 some modifier');
    });
    
    it('positive number toString', () => {
        const abs = new Absolute(8);
        expect(abs.toString(true)).to.equal('8');
    });
    
    it('negative number', () => {
        const abs = new Absolute(8);
        abs.process(provider);
        expect(abs.value).to.equal(8);
    });
    
    it('negative number toString', () => {
        const abs = new Absolute(8, false);
        expect(abs.toString(true)).to.equal(' - 8');
    });
    
    it('no parent no signstring', () => {
        const abs = new Absolute(8, true);
        abs.parent = null;
        expect(abs.getSignString(false)).to.equal('');
    });
    
    it('parent no signstring', () => {
        const abs = new Absolute(8, true);
        abs.parent = new DiceFunction(FunctionType.ADD, true);
        expect(abs.getSignString(false)).to.equal('');
    });
    
    it('parent negative signstring', () => {
        const abs = new Absolute(8, false);
        abs.parent = new DiceFunction(FunctionType.ADD, true);
        expect(abs.getSignString(false)).to.equal(' - ');
    });
    
    it('parent include positive signstring', () => {
        const abs = new Absolute(8, true);
        abs.parent = new DiceFunction(FunctionType.ADD, true);
        expect(abs.getSignString(true)).to.equal(' + ');
    });
    
    it('parent force hidden positive signstring min', () => {
        const abs = new Absolute(8, true);
        abs.parent = new DiceFunction(FunctionType.MIN, true);
        expect(abs.getSignString(true)).to.equal('');
    });
    
    it('parent force hidden positive signstring max', () => {
        const abs = new Absolute(8, true);
        abs.parent = new DiceFunction(FunctionType.MAX, true);
        expect(abs.getSignString(true)).to.equal('');
    });
    
    it('parent negative signstring short min', () => {
        const abs = new Absolute(8, false);
        abs.parent = new DiceFunction(FunctionType.MIN, true);
        expect(abs.getSignString(false)).to.equal('-');
    });
    
    it('parent negative signstring short max', () => {
        const abs = new Absolute(8, false);
        abs.parent = new DiceFunction(FunctionType.MAX, true);
        expect(abs.getSignString(false)).to.equal('-');
    });
    
    it('no parent positive signstring', () => {
        const abs = new Absolute(8, true);
        abs.parent = null;
        expect(abs.getSignString(true)).to.equal(' + ');
    });
});

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
        const diceExpression = <DiceExpression> result.children[0];
        const expected = new DiceExpression(1, 20, true);
        const expectedParent = new DiceFunction(FunctionType.ADD, true);
        expectedParent.addChild(expected);
        expect(diceExpression).to.eql(expected);
    });

    it('Leaving out dicecount', () => {
        const result = parse('d20');
        const diceExpression = <DiceExpression> result.children[0];
        expect(diceExpression.diceCount).to.equal(1);
    });

    it('Parsing dicecount', () => {
        const result = parse('3d20');
        const diceExpression = <DiceExpression> result.children[0];
        expect(diceExpression.diceCount).to.equal(3);
    });

    it('Parsing diesize', () => {
        const result = parse('3d10');
        const diceExpression = <DiceExpression> result.children[0];
        expect(diceExpression.dieSize).to.equal(10);
    });

    it('Parsing name in DiceExpression', () => {
        const result = parse('3d10 this is a name ');
        const diceExpression = <DiceExpression> result.children[0];
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
        "input": "",
        "parsed": "1d20",
        "result": "**11**"
    },
    {
        "input": "d20",
        "parsed": "1d20",
        "result": "**11**"
    },
    {
        "input": "1d20",
        "parsed": "1d20",
        "result": "**11**"
    },
    {
        "input": "+1d20",
        "parsed": "1d20",
        "result": "**11**"
    },
    {
        "input": "3d8 cold + 1d6 bludgeoning dmg+3d4 piercing-1 STR mod",
        "parsed": "3d8 cold + 1d6 bludgeoning dmg + 3d4 piercing - 1 STR mod",
        "result": "**27** (**15** cold (5, 5, 5), **4** bludgeoning dmg, **9** piercing (3, 3, 3), **-1** STR mod)"
    },
    {
        "input": "3d10-7+d4",
        "parsed": "3d10 - 7 + 1d4",
        "result": "**14** (**18** (6, 6, 6), **-7**, **3**)"
    },
    {
        "input": "3d10 stuff name-7 some modifier+d4 guidance",
        "parsed": "3d10 stuff name - 7 some modifier + 1d4 guidance",
        "result": "**14** (**18** stuff name (6, 6, 6), **-7** some modifier, **3** guidance)"
    },
    {
        "input": "min(2d20)+7",
        "parsed": "min(2d20) + 7",
        "result": "**18** (**11** (11, 11), **7**)"
    },
    {
        "input": "max(2d20)+7",
        "parsed": "max(2d20) + 7",
        "result": "**18** (**11** (11, 11), **7**)"
    },
    {
        "input": "add(2d20)+7",
        "parsed": "(2d20) + 7",
        "result": "**29** (**22** (11, 11), **7**)"
    },
    {
        "input": "d20-max(2d20)",
        "parsed": "1d20 - max(2d20)",
        "result": "**0** (**11**, **-11** (11, 11))"
    },
    {
        "input": "d20+max(2d20)",
        "parsed": "1d20 + max(2d20)",
        "result": "**22** (**11**, **11** (11, 11))"
    },
    {
        "input": "1d20 + min()",
        "parsed": "1d20",
        "result": "**11**"
    }
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
]

describe('Expression testing', () => {
    describe('parse', () => {
        variousExpressions.forEach(element => {
            let text = element.input;
            if(text === '') {
                text = '<empty string>';
            }
            it(text, () => {
                const result = parse(element.input);
                expect(result.getChildrenString()).to.equal(element.parsed);
            });
        });
    });

    describe('result', () => {
        variousExpressions.forEach(element => {
            let text = element.input;
            if(text === '') {
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