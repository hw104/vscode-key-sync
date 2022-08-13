# Key Sync

Synchronize **only** keybinding configuration. Using git repository not Gitst.

## Requirements

- Remote git repository that include keybindings.json

## Setup

1. Fill [Extension Settings](#extension-settings).
1. Run `Key Sync: Initialize local repository`.

## How to sync

Save keybindings to remote repository:

1. Run `Key Sync: Save keyboard shortcuts to local repository`.
1. Open Source Control panel and do something with git, typically `commit` and `push`.

Load keybindings from remote repository:

1. Run `Key Sync: Open local repository`.
1. Open Source Control panel and do something with git, like `pull` or `switch`.
1. Run `Key Sync: Load local repository json file to keyboard shortcuts`.

Or simply do Run `Key Sync: Sync keybindings.json with remote repository`.

## Commands

- `key-sync.init`: Initialize local repository from remote repository.
- `key-sync.sync`: Sync keybindings.json with remote repository.
- `key-sync.save`: Save current keyboard shortcuts to local repository.
- `key-sync.load`: Load keyboard shortcuts from local repository and apply it.
- `key-sync.open`: Open local repository with Source Control panel.
- `key-sync.close`: Close local repository on Source Control panel.
- `key-sync.cheat`: Open keyboard shortcuts cheat sheet (typically README.md).

## Extension Settings

* `key-sync.GitRemoteRepository`: Specifies an existing git remote repository.
* `key-sync.GitBranch`: Specifies an existing git branch.
* `key-sync.GitSrcPath`: Specifies an existing json file path.
* `key-sync.GitReadmePath`: Specifies a cheat sheet markdown file path in repository.
