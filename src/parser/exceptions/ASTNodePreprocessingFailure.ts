import Exception from '../../../exception/Exception';
import { Node } from '../../core/ASTGenerator';

export default class ASTNodePreprocessingFailure extends Exception {
  public constructor(public readonly node: Node) {
    super(`Failed to preprocess AST node: ${node.toString()}`);
  }
}
