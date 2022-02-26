# surround-with-tag README

VS Code Extension "surround-with-tag"

## Features

This Extension provides simple functionality to surround any activated text/elements with a HTML/XML tag.

First, select some text in the editor. Then in the Command Palette (`Ctrl + Shift + P`), type "Surround with Tag" - or simply hit `Ctrl + I`. This will prompt a window, where you can type in the tag name. The opening and closing tags get inserted before and after the initial text selection.

![demo](images/demo_01.gif)

The extension also supports basic [Emmet abbreviations](https://docs.emmet.io/abbreviations/). Given an XML file:

```XML
<xml>
    foo
</xml>
```

If `foo` is selected and the `Surround with Tag` command is executed with the following imput: `b>ar*3`. The following output will be generated:

```XML
<xml>
    <b>
        <ar>foo</ar>
        <ar>foo</ar>
        <ar>foo</ar>
    </b>
</xml>
```


## Requirements

None.

## Extension Settings

* `extension.surroundWithTag` (Command): Prompt surrounding with tag (Keybind: `Ctrl + I`)

## Known Issues

None so far.

The Extension has been tested under Windows 10/11. Any feedback on how it runs under Linux/MacOS is appreciated.

Please open an issue on github if you encounter any trouble or have feedback, suggestions or anything of that sort.

## Roadmap

Some of the following ideas might eventually be implemented:
* nice image
* Extensive testing
* Multi Select support
* Options, where caret should end

## Release Notes

See [Changelog](CHANGELOG.md).
