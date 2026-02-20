#!/bin/bash

# Build and preview script for reliable testing
# This avoids the react-refresh issues in dev mode

echo "======================================"
echo "  Node Image Editor - Building..."
echo "======================================"

cd "$(dirname "$0")"

# Build the project
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "======================================"
echo "  Starting Preview Server..."
echo "======================================"

# Get local IP
LOCAL_IP=$(python3 -c "
import socket
import subprocess
result = subprocess.run(['/usr/sbin/netstat', '-rn'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'en1' in line and '192.168' in line:
        parts = line.split()
        if len(parts) > 3:
            print(parts[3])
            break
" 2>/dev/null)

VPN_IP=$(python3 -c "
import subprocess
result = subprocess.run(['/usr/sbin/netstat', '-rn'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'utun' in line and '172.' in line:
        parts = line.split()
        if len(parts) > 3:
            ip = parts[3]
            if ip.startswith('172.'):
                print(ip.split('/')[0])
                break
" 2>/dev/null)

echo "Access URLs:"
echo "  Local:    http://localhost:4173"
echo "  LAN:      http://${LOCAL_IP:-localhost}:4173"
if [ -n "$VPN_IP" ]; then
    echo "  VPN:      http://${VPN_IP}:4173"
fi
echo ""
echo "Press Ctrl+C to stop"
echo "======================================"

# Start preview server
npm run preview
