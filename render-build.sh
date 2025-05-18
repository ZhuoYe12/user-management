#!/usr/bin/env bash
# Make script exit when a command fails
set -e

# Debug: Print current directory
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Navigate to frontend directory
# IMPORTANT: Assuming this script is in the repo root,
# navigate to the Angular frontend directory
cd angular-signup-verification-boilerplate

# Debug: Print npm and node versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies explicitly
# Using npm ci for clean install, or npm install
npm install

# Debug: Check if ng exists in the local bin
echo "Looking for ng executable in ./node_modules/.bin/ ..."
ls -la ./node_modules/.bin/ || echo "./node_modules/.bin/ not found or empty"

# Run build with explicit path to ng
# This uses the path relative to the current directory (angular-signup-verification-boilerplate)
./node_modules/.bin/ng build angular-signup-verification-boilerplate --configuration production 