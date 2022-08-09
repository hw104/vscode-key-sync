# Key Sync README

Synchronize **only** keybinding configuration. Using git repository not Gitst.

## Requirements

- Remote git repository that include keybindings.json

## Setup

1. `Key Sync: Initialize local repository`


## Commands

- `key-sync.init`: Initialize local repository from remote repository.
- `key-sync.open`: Open local repository with Source Control panel.
- `key-sync.save`: Save current keyboard shortcuts to local repository.
- `key-sync.load`: Load keyboard shortcuts from local repository and apply it.

## Extension Settings

This extension contributes the following settings:

* `key-sync.GitRemoteRepository`: Specifies an existing git remote repository
* `key-sync.GitBranch`: Specifies an existing git branch
* `key-sync.GitSrcPath`: Specifies an existing json file path
