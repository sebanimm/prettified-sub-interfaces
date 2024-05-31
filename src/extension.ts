import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const registeredLanguages = new Set<string>();

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);

      if (!range) {
        return null;
      }

      const word = document.getText(range);
      const interfaceRegex = /(?:\binterface\s+(\w+))\s*(?:extends\s+(\w+))/;
      const interfaceRange = document.getWordRangeAtPosition(
        position,
        interfaceRegex,
      );

      if (!interfaceRange) {
        return null;
      }

      const interfaceText = document.getText(interfaceRange);
      const match = interfaceRegex.exec(interfaceText);

      if (match && match[1] === word) {
        return new vscode.Hover(`This is interface '${match[1]}' declaration.`);
      }

      return null;
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
