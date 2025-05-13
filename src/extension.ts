import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "statusbar-color-change" is now active');

    // Store the original status bar color
    let originalColorCustomization: string | null = null;
    let isStatusBarColorChanged = false;

    // Function to get the user-configured color or default to red
    function getUnsavedFilesColor(): string {
        const config = vscode.workspace.getConfiguration('saveSaverStatusBarColorChange');
        return config.get<string>('unsavedFilesColor') || '#FF0000';
    }

    // Function to check if there are any dirty editors
    function checkForUnsavedFiles() {
        // First check if any active text editor is dirty
        const activeEditor = vscode.window.activeTextEditor;
        let isDirty = activeEditor?.document.isDirty || false;
        
        // If no active editor is dirty, check all tabs
        if (!isDirty) {
            isDirty = vscode.window.tabGroups.all
                .flatMap(group => group.tabs)
                .some(tab => tab.isDirty);
        }

        updateStatusBarColor(isDirty);
    }

    // Function to update the status bar color
    function updateStatusBarColor(isDirty: boolean) {
        // Get the current color customizations
        const currentConfig = vscode.workspace.getConfiguration('workbench');
        const currentColorCustomizations = currentConfig.get<Record<string, string>>('colorCustomizations') || {};

        // Only make changes if the state has changed
        if (isDirty && !isStatusBarColorChanged) {
            // Save original color if we haven't already
            if (originalColorCustomization === null) {
                originalColorCustomization = (currentColorCustomizations as any)['statusBar.background'] || null;
            }

            // Set status bar to user-configured color
            const newColorCustomizations = {
                ...currentColorCustomizations,
                'statusBar.background': getUnsavedFilesColor()
            };

            currentConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global)
                .then(() => {
                    isStatusBarColorChanged = true;
                    console.log('Status bar changed to configured color');
                });
        } else if (!isDirty && isStatusBarColorChanged) {
            // Restore original color if all files are saved
            const newColorCustomizations = { ...currentColorCustomizations };
            
            if (originalColorCustomization) {
                (newColorCustomizations as any)['statusBar.background'] = originalColorCustomization;
            } else {
                delete (newColorCustomizations as any)['statusBar.background'];
            }

            currentConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global)
                .then(() => {
                    isStatusBarColorChanged = false;
                    console.log('Status bar restored to original color');
                });
        }
    }

    // Run the check initially
    checkForUnsavedFiles();

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('saveSaverStatusBarColorChange.unsavedFilesColor') && isStatusBarColorChanged) {
                // If color setting changed and we're currently showing a colored status bar,
                // update to the new color immediately
                isStatusBarColorChanged = false; // force color update
                updateStatusBarColor(true);
            }
        })
    );

    // Set up event listeners
    const onDidChangeTextDocumentSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
        // Only act if the change affects the dirty state
        const previousIsDirty = isStatusBarColorChanged;
        const currentIsDirty = event.document.isDirty;
        
        if (previousIsDirty !== currentIsDirty) {
            updateStatusBarColor(currentIsDirty);
        } else if (currentIsDirty) {
            // If it's already dirty and we make more changes, ensure it's still colored
            updateStatusBarColor(true);
        }
    });

    // Listen for text document saves
    const onDidSaveTextDocumentSubscription = vscode.workspace.onDidSaveTextDocument(() => {
        // When a document is saved, check if there are still unsaved files
        checkForUnsavedFiles();
    });

    // Listen for editor changes
    const onDidChangeActiveTextEditorSubscription = vscode.window.onDidChangeActiveTextEditor(() => {
        checkForUnsavedFiles();
    });

    // Listen for tab changes
    const onDidChangeTabGroupsSubscription = vscode.window.tabGroups.onDidChangeTabs(() => {
        checkForUnsavedFiles();
    });

    // Add more event listeners
    const onDidOpenTextDocumentSubscription = vscode.workspace.onDidOpenTextDocument(() => {
        checkForUnsavedFiles();
    });

    const onDidCloseTextDocumentSubscription = vscode.workspace.onDidCloseTextDocument(() => {
        checkForUnsavedFiles();
    });

    // Add a command to manually refresh the status bar color
    const refreshCommand = vscode.commands.registerCommand('save-saver.refresh', () => {
        isStatusBarColorChanged = false; // force color update
        checkForUnsavedFiles();
    });

    // Add subscriptions to context for cleanup
    context.subscriptions.push(
        onDidChangeTextDocumentSubscription,
        onDidSaveTextDocumentSubscription,
        onDidChangeActiveTextEditorSubscription,
        onDidChangeTabGroupsSubscription,
        onDidOpenTextDocumentSubscription,
        onDidCloseTextDocumentSubscription,
        refreshCommand
    );
}

export function deactivate() {
    // Restore original color if extension is deactivated
    const currentConfig = vscode.workspace.getConfiguration('workbench');
    const currentColorCustomizations = currentConfig.get<Record<string, string>>('colorCustomizations') || {};
    
    // Remove our custom status bar color
    const newColorCustomizations = { ...currentColorCustomizations };
    delete (newColorCustomizations as any)['statusBar.background'];
    
    currentConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global);
}