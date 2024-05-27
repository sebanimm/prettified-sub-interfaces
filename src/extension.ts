import * as vscode from "vscode";

const languages = ["typescript", "typescriptreact"] as const;

export function activate(context: vscode.ExtensionContext) {
  console.log("activated");

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position, token) {
      console.log("triggered");
      return {
        contents: ["hover content"],
      };
    },
  };

  context.subscriptions.push(
    ...languages.map((language) =>
      vscode.languages.registerHoverProvider(
        {
          language,
        },
        hoverProvider,
      ),
    ),
  );
}
