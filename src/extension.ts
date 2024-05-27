import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const registeredUris = new Set<string>();

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position, token) {
      console.log("triggered");
      return {
        contents: ["hover content"],
      };
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
