#!/bin/bash
cd "$(dirname "$0")"
npm run build
npm run preview -- --host --port 4173
