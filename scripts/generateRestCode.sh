wget -nc https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/7.18.0/openapi-generator-cli-7.18.0.jar -O /tmp/openapi-generator-7.18.0.jar


java -jar /tmp/openapi-generator-7.18.0.jar generate \
  -i http://localhost:8080/openapi \
  -g typescript-angular \
  --skip-validate-spec \
  -o src/api/webrtc-server


# Replace URL.......
find src/api -type f | xargs sed -i 's/https/http/g'
