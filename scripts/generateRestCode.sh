#!/usr/bin/env bash

set -euo pipefail

OPENAPI_VERSION="7.21.0"

JAR_FILE="/tmp/openapi-generator-${OPENAPI_VERSION}.jar"
OPENAPI_URL="https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/${OPENAPI_VERSION}/openapi-generator-cli-${OPENAPI_VERSION}.jar"

OUT_DIR="src/api/webrtc-server"
SPEC_URL="http://localhost:8080/openapi"

echo "Downloading OpenAPI Generator ${OPENAPI_VERSION}..."
if [ ! -f "${JAR_FILE}" ]; then
  wget "${OPENAPI_URL}" -O "${JAR_FILE}"
else
  echo "Using cached ${JAR_FILE}"
fi

echo "Generating TypeScript Angular client..."
java -jar "${JAR_FILE}" generate \
  -i "${SPEC_URL}" \
  -g typescript-angular \
  --skip-validate-spec \
  --additional-properties=useFormData=true,supportsES6=true,ngVersion=21 \
  -o "${OUT_DIR}"

echo "Post-processing URLs (https -> http)..."
find src/api -type f -exec sed -i 's/https/http/g' {} +

echo "Done."
