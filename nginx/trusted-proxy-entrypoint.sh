#!/bin/sh
set -eu

: "${TRUSTED_PROXY_CIDRS:?TRUSTED_PROXY_CIDRS must contain the trusted tunnel or reverse-proxy IPs/CIDRs}"

case "${TRUSTED_PROXY_CIDRS}" in
  *[!0-9A-Fa-f:./,[:space:]]*)
    echo "Invalid TRUSTED_PROXY_CIDRS: only IP/CIDR values are allowed" >&2
    exit 1
    ;;
esac

trusted_file=/etc/nginx/trusted-proxies.conf
geo_file=/etc/nginx/trusted-proxy-geo.conf
: > "$trusted_file"
: > "$geo_file"
found=0

for cidr in $(printf '%s' "$TRUSTED_PROXY_CIDRS" | tr ',' ' '); do
  [ -n "$cidr" ] || continue
  case "$cidr" in
    0.0.0.0/0|::/0)
      echo "Refusing an unrestricted trusted proxy range: $cidr" >&2
      exit 1
      ;;
  esac
  printf 'set_real_ip_from %s;\n' "$cidr" >> "$trusted_file"
  printf '%s 1;\n' "$cidr" >> "$geo_file"
  found=1
done

[ "$found" -eq 1 ] || {
  echo "TRUSTED_PROXY_CIDRS must contain at least one IP or CIDR" >&2
  exit 1
}

nginx -t
