#!/bin/bash

# Get the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

URL="https://github.com/Exygy/askdarcel-web/compare/development...Exygy:askdarcel-web:${BRANCH_NAME}?expand=1"

open $URL
