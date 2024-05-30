import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const registeredUris = new Set<string>();

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);

      if (!range) {
        return null;
      }

      const word = document.getText(range);
      const interfaceRegex = /(?:\binterface\s+(\w+))\s*(?:extends\s+(\w+))/g;
      const text = document.getText();

      let match;

      while ((match = interfaceRegex.exec(text)) !== null) {
        if (match[1] === word) {
          return new vscode.Hover(
            `This is interface '${match[1]}' declaration.`,
          );
        }
      }

      return null;
    },
  };

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((e) => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const documentUri = editor.document.uri.toString();
      const languageId = editor.document.languageId;
      const key = `${documentUri}:${languageId}`;

      if (registeredUris.has(key)) {
        return;
      }

      registeredUris.add(key);

      context.subscriptions.push(
        vscode.languages.registerHoverProvider(
          { language: languageId },
          hoverProvider,
        ),
      );
    }),
  );
}
