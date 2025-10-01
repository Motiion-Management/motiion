#!/usr/bin/env bash

set -euo pipefail

# Navigate to project root (EAS Build runs this from apps/native)
cd ../..

# Set up SSH for git submodules
if [ -n "${SUBMODULE_SSH_KEY:-}" ]; then
  echo "Setting up SSH for git submodules..."

  # Create .ssh directory
  mkdir -p ~/.ssh

  # Decode and write the SSH key
  echo "$SUBMODULE_SSH_KEY" | base64 -d > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa

  # Add GitHub to known hosts
  ssh-keyscan github.com >> ~/.ssh/known_hosts

  echo "SSH configuration complete"
fi

# Initialize git submodules
echo "Initializing git submodules..."
git submodule update --init --recursive

echo "Git submodules initialized successfully"
