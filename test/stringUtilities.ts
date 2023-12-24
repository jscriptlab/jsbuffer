import test from 'ava';
import { lowerFirst, upperFirst } from '../code-generator/stringUtilities';

test('it should lower first', (t) => {
  t.deepEqual(lowerFirst('UserProfile'), 'userProfile');
});

test('it should upper first', (t) => {
  t.deepEqual(upperFirst('userProfile'), 'UserProfile');
});
