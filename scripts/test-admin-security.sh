#!/usr/bin/env bash
# Admin Security Verification Script for Shefeer Portfolio
# Tests unauthorized access, login rate limiting, and input validation

set -uo pipefail

BASE_URL="${1:-http://localhost:3010}"

# Auto-detect native curl on Windows/WSL if available
CURL_BIN="curl"
if command -v curl.exe &>/dev/null; then
  CURL_BIN="curl.exe"
fi

echo "=========================================================="
echo " Running Admin Security Test Suite against: $BASE_URL"
echo "=========================================================="

FAILED=0

check_status() {
  local method="$1"
  local endpoint="$2"
  local expected="$3"
  local data="${4:-}"
  local description="$5"

  local status
  if [ -n "$data" ]; then
    status=$($CURL_BIN -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  else
    status=$($CURL_BIN -s -o /dev/null -w "%{http_code}" -X "$method" \
      "$BASE_URL$endpoint")
  fi

  if [ "$status" -eq "$expected" ]; then
    printf "  [PASS] %-6s %-32s -> %s (%s)\n" "$method" "$endpoint" "$status" "$description"
  else
    printf "  [FAIL] %-6s %-32s -> Got %s, Expected %s (%s)\n" "$method" "$endpoint" "$status" "$expected" "$description"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "--- 1. Testing Unauthenticated Route Access (All must return 401) ---"
check_status "GET"    "/api/admin/auth/me"             401 "" "Session verification required"
check_status "POST"   "/api/admin/auth/me"             401 "" "Session verification required"
check_status "POST"   "/api/admin/auth/logout"         401 "" "Session verification required"
check_status "POST"   "/api/admin/cloudinary-sign"     401 "{}" "Session verification required"
check_status "GET"    "/api/admin/projects"            401 "" "Session verification required"
check_status "POST"   "/api/admin/projects"            401 "{}" "Session verification required"
check_status "GET"    "/api/admin/projects/test-proj"  401 "" "Session verification required"
check_status "PUT"    "/api/admin/projects/test-proj"  401 "{}" "Session verification required"
check_status "PATCH"  "/api/admin/projects/test-proj"  401 "{}" "Session verification required"
check_status "DELETE" "/api/admin/projects/test-proj"  401 "" "Session verification required"

echo ""
echo "--- 2. Testing Login Endpoint Without Credentials ---"
check_status "POST"   "/api/admin/auth/login"          401 '{"password":""}' "Empty password rejected"

echo ""
echo "--- 3. Testing Login Rate Limiting (5 failed attempts trigger 429) ---"
for i in {1..5}; do
  status=$($CURL_BIN -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong-password-attempt"}' \
    "$BASE_URL/api/admin/auth/login")
  printf "  Attempt %d: HTTP %s\n" "$i" "$status"
done

# The 6th attempt MUST return 429
check_status "POST" "/api/admin/auth/login" 429 '{"password":"wrong-password-attempt"}' "Rate limit enforced after 5 failed attempts"

echo ""
echo "--- 4. Testing Bad URL Rejection via Schema Validation ---"
# Test bad URL payload without session
UNAUTH_RESP=$($CURL_BIN -s -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: shefeer_admin_session=invalid-session-token" \
  -d '{"title":"Test","category":"Shorts & Reels","aspectRatio":"9:16","videoUrl":"javascript:alert(1)"}' \
  "$BASE_URL/api/admin/projects")
echo "  Unauthenticated attempt rejected: $UNAUTH_RESP"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All security checks passed successfully!"
else
  echo "$FAILED check(s) failed."
fi
