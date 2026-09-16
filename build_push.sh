#!/usr/bin/env bash
set -euo pipefail

project="aci-customer-assistant"
tag="${1:-$(date -u +%Y%m%d-%H%M%S)}"
image="registry.acimisai.com/${project}-app:${tag}"

docker buildx build --platform linux/amd64 --tag "${image}" --push .
manifest="$(docker buildx imagetools inspect "${image}")"
case "$manifest" in
  *linux/amd64*) ;;
  *) printf 'Manifest for %s does not contain linux/amd64\n' "$image" >&2; exit 1 ;;
esac
printf 'Pushed %s\n' "${image}"
