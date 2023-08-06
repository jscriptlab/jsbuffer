import ASTGenerator, { ASTGenerationException } from '../src/ASTGenerator';
import DetailedErrorPrinter from '../cli/DetailedErrorPrinter';
import { Suite } from 'sarg';
import Tokenizer from '../src/Tokenizer';
import assert from 'assert';

const suite = new Suite();

suite.test('it should print detailed error for missing semicolons', () => {
  const txt = `type X {\n` + `  int a;\n` + `  int b\n` + `}`;
  const tokens = new Tokenizer({
    contents: Buffer.from(txt, 'utf8'),
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  })
    .tokenize()
    .tokens();
  const ast = new ASTGenerator(tokens);
  // assert.strict.throws(
  //   () => {
  //     ast.generate();
  //   },
  //   (reason) => {
  //     assert.strict.ok(reason instanceof ASTGenerationException);
  //     assert.strict.deepEqual(
  //       new DetailedErrorPrinter(ast, tokens).print(reason),
  //       [
  //         '1 | type X {',
  //         '2 |   int a;',
  //         '3 |   int b',
  //         '           ^',
  //         '           Expected ; punctuator, but got } instead',
  //       ]
  //     );
  //   }
  // );
  try {
    ast.generate();
    throw 1;
  } catch (reason) {
    assert.strict.ok(reason instanceof ASTGenerationException);
    assert.strict.deepEqual(
      new DetailedErrorPrinter(ast, tokens).print(reason),
      [
        '1 | type X {',
        '2 |   int a;',
        '3 |   int b',
        '           ^',
        '           Expected ; punctuator, but got } instead',
      ]
    );
  }
});

export default suite;
