import * as vscode from "vscode";
import ts from "typescript";

export function activate(context: vscode.ExtensionContext) {
  const registeredLanguages = new Set<string>();

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);

      if (!range) {
        return null;
      }

      const program = ts.createProgram([document.fileName], {});
      const sourceFile = program.getSourceFile(document.fileName);

      if (!sourceFile) {
        return null;
      }

      const subInterfaces: ts.InterfaceDeclaration[] = [];

      ts.forEachChild(sourceFile, visit);

      function visit(node: ts.Node) {
        if (ts.isInterfaceDeclaration(node) && isSubInterface(node)) {
          subInterfaces.push(node);
        }

        ts.forEachChild(node, visit);
      }

      function isSubInterface(interfaceDeclaration: ts.InterfaceDeclaration) {
        return (
          interfaceDeclaration.heritageClauses !== undefined &&
          interfaceDeclaration.heritageClauses.some(
            (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword,
          )
        );
      }

      const word = document.getText(range);

      for (const subInterface of subInterfaces) {
        if (subInterface.name.text !== word) {
          continue;
        }

        return new vscode.Hover(`sub interface ${word}`);
      }
    },
  };

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((e) => {
      const editors = vscode.window.visibleTextEditors;

      editors.forEach((editor) => {
        const { languageId, uri: documentUri } = editor.document;

        if (registeredLanguages.has(languageId)) {
          return;
        }

        const isUriInDiagnostics = e.uris.some(
          (uri) => uri.toString() === documentUri.toString(),
        );

        if (!isUriInDiagnostics) {
          return;
        }

        registeredLanguages.add(languageId);

        context.subscriptions.push(
          vscode.languages.registerHoverProvider(
            { language: languageId },
            hoverProvider,
          ),
        );
      });
    }),
  );
}

export function deactivate() {}
