#!/usr/bin/env bash

set -euo pipefail

echo "==== EAS Build Pre-Install Script Started ===="
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Navigate to project root
# EAS Build may run this from apps/native or from repo root
if [ -f "package.json" ] && [ -d "apps" ]; then
  echo "Already in project root"
  REPO_ROOT="."
elif [ -f "../../package.json" ] && [ -d "../../apps" ]; then
  echo "Navigating from apps/native to project root"
  cd ../..
  REPO_ROOT="."
else
  echo "ERROR: Cannot determine project root location"
  echo "PWD: $(pwd)"
  exit 1
fi

echo "Project root: $(pwd)"
echo "Checking for .gitmodules..."
ls -la .gitmodules || echo "WARNING: .gitmodules not found!"

# Set up SSH for git submodules
if [ -n "${SUBMODULE_SSH_KEY:-}" ]; then
  echo "Setting up SSH for git submodules..."

  # Create .ssh directory
  mkdir -p ~/.ssh

  # Decode and write the SSH key
  echo "$SUBMODULE_SSH_KEY" | base64 -d > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa

  # Add GitHub to known hosts
  ssh-keyscan github.com >> ~/.ssh/known_hosts 2>&1

  echo "SSH configuration complete"
else
  echo "WARNING: SUBMODULE_SSH_KEY not set - submodule initialization may fail for private repos"
fi

# Initialize git submodules
echo "Initializing git submodules..."
if git submodule update --init --recursive; then
  echo "Git submodules initialized successfully"
else
  echo "ERROR: Failed to initialize git submodules"
  exit 1
fi

# Verify zodvex was initialized
echo "Verifying zodvex submodule..."
if [ -f "packages/zodvex/package.json" ]; then
  echo "✓ zodvex submodule initialized successfully"
  echo "zodvex package.json contents:"
  cat packages/zodvex/package.json | grep -E '"name"|"version"'
else
  echo "ERROR: zodvex submodule not found at packages/zodvex/package.json"
  echo "Directory contents of packages/:"
  ls -la packages/ || echo "packages/ directory not found"
  exit 1
fi

echo "==== EAS Build Pre-Install Script Completed Successfully ===="
