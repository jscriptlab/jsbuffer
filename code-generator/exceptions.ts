import Exception from '../exception/Exception';
import {
  ASTGeneratorOutputNode,
  INodeExportStatement,
  INodeTraitDefinition,
  NodeTypeExpression,
} from '../src/ASTGenerator';
import FileGenerator from './FileGenerator';
import { ResolvedType } from './types';

export class ExceptionInternalError extends Exception {}

export class ASTNodePreprocessingFailure extends Exception {
  public constructor(public readonly node: ASTGeneratorOutputNode) {
    super();
  }
}

export class DuplicateScopeIdentifier extends Exception {
  public constructor(
    public readonly node: FileGenerator | ASTGeneratorOutputNode,
  ) {
    super();
  }
}

export class TypeScriptConfigurationParsingError extends Exception {
  public constructor(
    public readonly configuration: unknown | Record<string, unknown>,
  ) {
    super();
  }
}

export class UnexpectedTraitOutputNodeCount extends Exception {
  public constructor(public readonly trait: INodeTraitDefinition) {
    super();
  }
}

export class UnhandledResolvedType extends Exception {
  public constructor(public readonly resolvedType: ResolvedType) {
    super('Unhandled resolved type');
  }
}

export class UnsupportedTypeExpression extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class UnsupportedTrait extends Exception {
  public constructor(public readonly name: string) {
    super();
  }
}

export class UnsupportedTemplate extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class InvalidTemplateArgumentCount extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class TypeNotFound extends Exception {}

export class TypeExpressionNotExported extends Exception {
  public constructor(public readonly node: ResolvedType) {
    super();
  }
}

export class UnsupportedGenericExpression extends Exception {
  public constructor(public readonly node: ResolvedType) {
    super();
  }
}

export class DuplicateExport extends Exception {
  public constructor(public readonly node: INodeExportStatement) {
    super();
  }
}

export class UnhandledNode extends Exception {
  public constructor(public readonly node: ASTGeneratorOutputNode) {
    super();
  }
}
