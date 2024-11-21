import { replaceDynamicValue } from '../src/functions';
describe('check functions', () => {
    it('should replace all dynamic values', () => {
        expect(
            replaceDynamicValue('Hello {name}, you are {age} years old', {
                name: 'John',
                age: 30,
            })
        ).toBe('Hello John, you are 30 years old');
    });

    it('should replace all dynamic values with boolean', () => {
        expect(
            replaceDynamicValue('Is it {value}', {
                value: true,
            })
        ).toBe('Is it ✅');
    });

    it('should replace all dynamic values with null', () => {
        expect(
            replaceDynamicValue('Is it {value}', {
                value: null,
            })
        ).toBe('Is it ');
    });
});
