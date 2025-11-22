#!/bin/bash

REPO_USER="ellis-ttt"
REPO_NAME="manmanlai"
BIN_NAME="cors-somewhere"
INSTALL_PATH="./$BIN_NAME"

pkill -x "$BIN_NAME" || true

curl -L -o "${INSTALL_PATH}.new" "https://github.com/$REPO_USER/$REPO_NAME/releases/latest/download/$BIN_NAME"

chmod +x "${INSTALL_PATH}.new"
mv "${INSTALL_PATH}.new" "$INSTALL_PATH"

nohup "$INSTALL_PATH" > /dev/null 2>&1 &