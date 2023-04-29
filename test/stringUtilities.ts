import { Suite } from 'sarg';
import { lowerFirst, upperFirst } from '../code-generator/stringUtilities';
import assert from 'assert';

const suite = new Suite();

suite.test('it should lower first', () => {
  assert.strict.equal(lowerFirst('UserProfile'), 'userProfile');
});

suite.test('it should upper first', () => {
  assert.strict.equal(upperFirst('userProfile'), 'UserProfile');
});

export default suite;
