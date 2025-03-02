# Save Saver Status Bar Color Change

A Visual Studio Code extension that changes the status bar color when there are unsaved files in the editor.

Have a look at it at the [visualstudio marketplace](https://marketplace.visualstudio.com/items?itemName=raffepaffe.save-saver) for more details.

## Features

- Status bar changes color when any file has unsaved changes
- Status bar returns to its original color when all files are saved
- Works across all open tabs and editors
- Automatically activates when VS Code starts
- Configurable color for unsaved files status

## How it works

This extension monitors the state of all open tabs in VS Code. When it detects that any tab has unsaved changes (is "dirty"), it changes the status bar color to the configured color (red by default). Once all files are saved, the status bar returns to its original color.

## Extension Settings

This extension contributes the following settings:

* `saveSaverStatusBarColorChange.unsavedFilesColor`: The color to use for the status bar when there are unsaved files. Use standard hex color format (e.g., #FF0000 for red).

## How to Configure

1. Open VS Code Settings (File > Preferences > Settings or Ctrl+,)
2. Search for "Save Saver Status Bar Color"
3. Enter your desired color in hex format (e.g., #00FF00 for green)

## Requirements

- Visual Studio Code 1.97.0 or higher

## Known Issues

- None reported yet

## Release Notes

### 0.0.1

Initial release:
- Basic functionality to change status bar color based on unsaved files
- Configurable color option

---

## Development

- Clone the repository
- Run `npm install`
- Run `npm run compile`
- Press F5 to open a new window with your extension loaded

## Credits

Thank you to Moa and Carl for help and support. 

## Contributing

As with most tools, this will likely miss some cases. If you come across a case which you
think should be covered and isn't, please file an issue including a minimum reproducible example of the case.

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE.md) file for more
details.


