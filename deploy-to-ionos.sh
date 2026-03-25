#!/bin/bash
echo "🌙 Deploying kaneonexus.net from GitHub"
echo -n "IONOS Password: "
read -s PASS
echo ""
cd ~/kaneonexus-website
git pull origin main
lftp sftp://a2264941:"$PASS"@access-5019724935.webspace-host.com:22 << EOF
set sftp:auto-confirm yes
mirror -R --verbose . /
quit
EOF
echo "✅ Deployed to kaneonexus.net!"
