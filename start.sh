#!/bin/bash

# Node Image Editor - Startup Script
# Starts the dev server and shows accessible URLs

echo "======================================"
echo "  Node Image Editor - Starting..."
echo "======================================"
echo ""

# Get local IP address
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

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="<your-local-ip>"
fi

# Get VPN IP if available
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
echo "  Local:    http://localhost:3000"
echo "  LAN:      http://${LOCAL_IP}:3000"
if [ -n "$VPN_IP" ]; then
    echo "  VPN:      http://${VPN_IP}:3000"
fi
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"
echo ""

# Start the dev server
cd "$(dirname "$0")"
npm run dev
