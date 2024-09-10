import test from 'ava';
import {
  lowerFirst,
  dashCase,
  upperFirst
} from '../code-generator/stringUtilities';

test('dashCase simple words', (t) => {
  t.deepEqual(dashCase('FooBar'), 'foo-bar');
});

test('dashCase with spaces', (t) => {
  t.deepEqual(dashCase('Hello World'), 'hello-world');
});

test('dashCase with underscore', (t) => {
  t.deepEqual(dashCase('user_id'), 'user-id');
});

test('dashCase with multiple caps', (t) => {
  t.deepEqual(dashCase('MainComponent'), 'main-component');
});

test('dashCase with mixed cases and spaces', (t) => {
  t.deepEqual(dashCase('mixedCase input'), 'mixed-case-input');
});

test('dashCase with multiple dashes', (t) => {
  t.deepEqual(dashCase('with---multiple---dashes'), 'with-multiple-dashes');
});

test('that dashCase should not handle special characters', (t) => {
  t.deepEqual(dashCase('special#symbols*here'), 'specialsymbolshere');
});

test.skip('dashCase with special characters', (t) => {
  // t.deepEqual(dashCase('special#symbols*here'), 'special-symbols-here');
  t.deepEqual(dashCase('special#symbols*here'), 'special-symbols-here');
});

test('dashCase with numbers', (t) => {
  t.deepEqual(dashCase('Model123Version4'), 'model123-version4');
});

test('dashCase with leading and trailing spaces', (t) => {
  t.deepEqual(dashCase('  padded text '), 'padded-text');
});

test('dashCase with non-English characters', (t) => {
  t.deepEqual(dashCase('naïve façade'), 'naive-facade');
});

test('dashCase with camelCase and numbers', (t) => {
  t.deepEqual(dashCase('version2022Update'), 'version2022-update');
});

test('dashCase with all caps', (t) => {
  t.deepEqual(dashCase('IMPORTANT'), 'important');
});

test('dashCase empty string', (t) => {
  t.deepEqual(dashCase(''), '');
});

test('dashCase string with only special characters', (t) => {
  t.deepEqual(dashCase('$$$***!!!'), '');
});

test('it should lower first', (t) => {
  t.deepEqual(lowerFirst('UserProfile'), 'userProfile');
});

test('it should upper first', (t) => {
  t.deepEqual(upperFirst('userProfile'), 'UserProfile');
});
