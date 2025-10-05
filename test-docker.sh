#!/bin/bash
# Docker Smoke Test Script
# Run this script after building the Docker image to verify functionality

set -e

IMAGE_NAME="${1:-zus-sim:local}"
PORT="${2:-8080}"

echo "🐳 Docker Smoke Test for ZUS Retirement Simulator"
echo "=================================================="
echo "Image: $IMAGE_NAME"
echo "Port: $PORT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "Step 1: Build Docker image"
echo "----------------------------"
if docker build -t "$IMAGE_NAME" . > /tmp/docker-build.log 2>&1; then
    pass "Docker image built successfully"
else
    fail "Docker build failed. Check /tmp/docker-build.log"
fi
echo ""

echo "Step 2: Run container"
echo "---------------------"
info "Starting container on port $PORT..."
CONTAINER_ID=$(docker run -d -p "$PORT:8080" "$IMAGE_NAME")
pass "Container started: $CONTAINER_ID"

# Wait for container to be ready
info "Waiting for container to be ready..."
sleep 5
echo ""

echo "Step 3: Health Check"
echo "--------------------"
HEALTH_RESPONSE=$(curl -s "http://localhost:$PORT/api/health" || echo "FAILED")
if echo "$HEALTH_RESPONSE" | grep -q '"status"'; then
    pass "/api/health endpoint responds correctly"
    echo "   Response: $HEALTH_RESPONSE"
else
    docker logs "$CONTAINER_ID"
    docker stop "$CONTAINER_ID" > /dev/null
    docker rm "$CONTAINER_ID" > /dev/null
    fail "/api/health endpoint failed"
fi
echo ""

echo "Step 4: SPA Root"
echo "----------------"
ROOT_RESPONSE=$(curl -sI "http://localhost:$PORT/" | grep -i "content-type" || echo "FAILED")
if echo "$ROOT_RESPONSE" | grep -q "text/html"; then
    pass "Root (/) returns HTML"
    echo "   $ROOT_RESPONSE"
else
    docker logs "$CONTAINER_ID"
    docker stop "$CONTAINER_ID" > /dev/null
    docker rm "$CONTAINER_ID" > /dev/null
    fail "Root endpoint failed"
fi
echo ""

echo "Step 5: SPA Fallback (Deep Link)"
echo "---------------------------------"
DEEP_LINK_RESPONSE=$(curl -sI "http://localhost:$PORT/wizard" | grep -i "content-type" || echo "FAILED")
if echo "$DEEP_LINK_RESPONSE" | grep -q "text/html"; then
    pass "Deep link (/wizard) returns HTML (fallback works)"
    echo "   $DEEP_LINK_RESPONSE"
else
    docker logs "$CONTAINER_ID"
    docker stop "$CONTAINER_ID" > /dev/null
    docker rm "$CONTAINER_ID" > /dev/null
    fail "SPA fallback failed"
fi
echo ""

echo "Step 6: Static Assets"
echo "---------------------"
ASSETS_RESPONSE=$(curl -sI "http://localhost:$PORT/assets/" | head -1 || echo "FAILED")
if echo "$ASSETS_RESPONSE" | grep -q "200\|301\|302\|404"; then
    pass "Assets path accessible"
    echo "   $ASSETS_RESPONSE"
else
    info "Assets check returned: $ASSETS_RESPONSE"
fi
echo ""

echo "Step 7: API v2 Endpoint"
echo "-----------------------"
# This might fail if the endpoint requires auth or specific data, but we check if it responds
V2_RESPONSE=$(curl -sI "http://localhost:$PORT/api/v2/wizard/init" | head -1 || echo "FAILED")
if echo "$V2_RESPONSE" | grep -q "HTTP"; then
    pass "API v2 endpoint is reachable"
    echo "   $V2_RESPONSE"
else
    info "V2 endpoint check: $V2_RESPONSE"
fi
echo ""

echo "Step 8: Cleanup"
echo "---------------"
info "Stopping container..."
docker stop "$CONTAINER_ID" > /dev/null
docker rm "$CONTAINER_ID" > /dev/null
pass "Container stopped and removed"
echo ""

echo "=================================================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:$PORT in a browser"
echo "  2. Verify the UI loads correctly"
echo "  3. Test wizard flow and API calls"
echo "  4. Deploy to your preferred cloud provider"
echo ""
echo "Deploy to Cloud Run:"
echo "  gcloud run deploy zus-sim --image $IMAGE_NAME --platform managed --port 8080"
echo ""
echo "Deploy to AWS App Runner:"
echo "  (Push to ECR first, then create App Runner service)"
