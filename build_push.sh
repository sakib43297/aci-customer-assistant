#!/usr/bin/env bash
set -euo pipefail

project="aci-customer-assistant"
tag="${1:-$(date -u +%Y%m%d-%H%M%S)}"
image="registry.acimisai.com/${project}-app:${tag}"

docker buildx build --platform linux/amd64 --tag "${image}" --push .
docker buildx imagetools inspect "${image}" | grep -q 'linux/amd64'
printf 'Pushed %s\n' "${image}"
