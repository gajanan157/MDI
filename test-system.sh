#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "MD India Enrollment System - Microservices E2E Test"
echo "=========================================================="

MASTER_URL="http://localhost:8081"
INWARD_URL="http://localhost:8082"
POLICY_URL="http://localhost:8083"
WORKFLOW_URL="http://localhost:8084"
MEMBER_URL="http://localhost:8085"
ECARD_URL="http://localhost:8086"

echo -e "\n[1/7] Testing Master Data & User Directory..."
curl -s "$MASTER_URL/v1/insurer" | grep -q "success" && echo "  [OK] Master insurers API responding"

echo -e "\n[2/7] Testing Inward Management..."
curl -s "$INWARD_URL/v1/files/inwards" | grep -q "success" && echo "  [OK] Inwards API responding"

echo -e "\n[3/7] Testing Policy Drafting..."
curl -s "$POLICY_URL/v1/ocr" | grep -q "success" && echo "  [OK] Policy OCR work items responding"

echo -e "\n[4/7] Testing Workflow Service..."
curl -s "$WORKFLOW_URL/api/v1/workflow/instances/stage-counts" | grep -q "success" && echo "  [OK] Workflow stage counts responding"

echo -e "\n[5/7] Testing QC Approval..."
curl -s -X POST "$POLICY_URL/v1/enroll/policy/QC" \
  -H "Content-Type: application/json" \
  -d '{"inwardNo":"INW-2026-1001","status":"COMPLETED","policyNo":"POL-TCS-2026-001","policyScheduleJson":{}}' \
  | grep -q "POL-" && echo "  [OK] Policy Approved and policyId generated"

echo -e "\n[6/7] Testing Member Data Service..."
curl -s "$MEMBER_URL/v1/enrollment/progress?policyId=POL-10001&inwardNo=INW-2026-1001" | grep -q "COMPLETED" && echo "  [OK] Member enrollment progress responding"

echo -e "\n[7/7] Testing E-Card Service..."
curl -s "$ECARD_URL/v1/ecards/template-details" | grep -q "success" && echo "  [OK] E-Card templates responding"

echo -e "\n=========================================================="
echo "System verification complete!"
echo "=========================================================="
