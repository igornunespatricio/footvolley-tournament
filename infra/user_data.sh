#!/bin/bash
set -euxo pipefail
exec > /var/log/user-data.log 2>&1

dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

mkdir -p /usr/libexec/docker/cli-plugins
curl -SL https://github.com/docker/buildx/releases/download/v0.35.0/buildx-v0.35.0.linux-amd64 \
  -o /usr/libexec/docker/cli-plugins/docker-buildx
chmod +x /usr/libexec/docker/cli-plugins/docker-buildx

cd /home/ec2-user
git clone ${repo_url} app
chown -R ec2-user:ec2-user app
cd app

# --- Fetch this instance's public IP via IMDSv2 ---
TOKEN=$$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

PUBLIC_IP=$$(curl -s -H "X-aws-ec2-metadata-token: $$TOKEN" \
  http://169.254.169.254/latest/meta-data/public-ipv4)

echo "Detected public IP: $$PUBLIC_IP"

export VITE_API_URL="http://$${PUBLIC_IP}:3001/api"

docker compose build --build-arg VITE_API_URL="$$VITE_API_URL" frontend
docker compose up -d