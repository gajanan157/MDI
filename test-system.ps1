# MD India Enrollment System - End-to-End System Test Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "MD India Enrollment System - Microservices E2E Test" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$masterBase = "http://localhost:8081"
$inwardBase = "http://localhost:8082"
$policyBase = "http://localhost:8083"
$workflowBase = "http://localhost:8084"
$memberBase = "http://localhost:8085"
$ecardBase = "http://localhost:8086"

# 1. Master Service
Write-Host "`n[1/7] Testing Master Data & User Directory (Port 8081)..." -ForegroundColor Yellow
try {
    $insurers = Invoke-RestMethod -Uri "$masterBase/v1/insurer" -Method Get
    Write-Host "  [OK] Insurers count: $($insurers.data.Count)" -ForegroundColor Green
    
    $groups = Invoke-RestMethod -Uri "$masterBase/api/v1/groups" -Method Get
    Write-Host "  [OK] User Groups count: $($groups.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Master service check failed: $_" -ForegroundColor Red
}

# 2. Inward Service
Write-Host "`n[2/7] Testing Inward Management & ID Generation (Port 8082)..." -ForegroundColor Yellow
try {
    $inwards = Invoke-RestMethod -Uri "$inwardBase/v1/files/inwards" -Method Get
    Write-Host "  [OK] Total inwards in repository: $($inwards.data.totalElements)" -ForegroundColor Green

    $newInward = Invoke-RestMethod -Uri "$inwardBase/v1/generateId/inwardno" -Method Post
    Write-Host "  [OK] Generated new Inward No: $($newInward.data.inwardNo)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Inward service check failed: $_" -ForegroundColor Red
}

# 3. Policy Service - Maker Save
Write-Host "`n[3/7] Testing Policy Drafting & Processor Save (Port 8083)..." -ForegroundColor Yellow
try {
    $workItems = Invoke-RestMethod -Uri "$policyBase/v1/ocr" -Method Get
    Write-Host "  [OK] Work items available: $($workItems.data.totalElements)" -ForegroundColor Green

    $processDraftBody = @{
        inwardNo = "INW-2026-1001"
        policyNumber = "POL-TCS-2026-001"
        status = "QC_PENDING"
        policyRecordType = "LIVE"
        policyScheduleJson = @{
            corporateObject = @{ corporateId = "CORP-201" }
            policyObject = @{ sumInsured = 500000; netPremium = 4500000; grossPremium = 5310000 }
        }
    } | ConvertTo-Json -Depth 5

    $processRes = Invoke-RestMethod -Uri "$policyBase/v1/policy-endorsements/process" -Method Post -Body $processDraftBody -ContentType "application/json"
    Write-Host "  [OK] Tab draft saved: $($processRes.message)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Policy service save failed: $_" -ForegroundColor Red
}

# 4. Workflow Service - Assignment & Transitions
Write-Host "`n[4/7] Testing Workflow Engine & Assignments (Port 8084)..." -ForegroundColor Yellow
try {
    $counts = Invoke-RestMethod -Uri "$workflowBase/api/v1/workflow/instances/stage-counts" -Method Get
    Write-Host "  [OK] Workflow stage counts: Total=$($counts.data.total), Pending=$($counts.data.pending)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Workflow service check failed: $_" -ForegroundColor Red
}

# 5. Policy Service - QC Approval (The Hinge)
Write-Host "`n[5/7] Testing QC Maker-Checker Approval (Port 8083)..." -ForegroundColor Yellow
try {
    $qcApproveBody = @{
        inwardNo = "INW-2026-1001"
        status = "COMPLETED"
        policyNo = "POL-TCS-2026-001"
        policyProposerType = "CORPORATE"
        policyRecordType = "LIVE"
        policyScheduleJson = @{
            corporateObject = @{ corporateId = "CORP-201" }
            policyObject = @{ sumInsured = 500000; netPremium = 4500000; grossPremium = 5310000 }
        }
    } | ConvertTo-Json -Depth 5

    $qcRes = Invoke-RestMethod -Uri "$policyBase/v1/enroll/policy/QC" -Method Post -Body $qcApproveBody -ContentType "application/json"
    Write-Host "  [OK] Policy Approved! New Policy ID returned: $($qcRes.data)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] QC Approval failed: $_" -ForegroundColor Red
}

# 6. Member Service - Processing, Statistics & Exceptions
Write-Host "`n[6/7] Testing Member Data Processing, Progress & Exceptions (Port 8085)..." -ForegroundColor Yellow
try {
    $progress = Invoke-RestMethod -Uri "$memberBase/v1/enrollment/progress?policyId=POL-10001&inwardNo=INW-2026-1001" -Method Get
    Write-Host "  [OK] Progress Polling: Status=$($progress.data.status), Percentage=$($progress.data.percentage)%" -ForegroundColor Green

    $stats = Invoke-RestMethod -Uri "$memberBase/v1/member/statistics?policyId=POL-10001" -Method Get
    Write-Host "  [OK] Member Stats: Total=$($stats.data.totalMembers), Enrolled=$($stats.data.enrolled), Failed=$($stats.data.failed)" -ForegroundColor Green

    $enrolled = Invoke-RestMethod -Uri "$memberBase/v1/members/search?policyId=POL-10001" -Method Get
    Write-Host "  [OK] Enrolled Members search: $($enrolled.data.totalElements) members found" -ForegroundColor Green

    $reconciliation = Invoke-RestMethod -Uri "$memberBase/v1/members/POL-10001/reconciliation-report?reconciliationStatus=EXISTING_MEMBER_MATCHED,NEW_ENROLLED" -Method Get
    Write-Host "  [OK] Reconciliation Report (Matched/New): $($reconciliation.data.totalElements) rows" -ForegroundColor Green

    # Underwriting Exception Approval
    $approveExceptionBody = @{
        stagingMemberEnrollmentIds = @("STG-MEM-001")
        exceptionApprovalRemark = "Special Underwriting approval granted per policy endorsement terms"
    } | ConvertTo-Json

    $excRes = Invoke-RestMethod -Uri "$memberBase/v1/members/exceptions/enroll" -Method Post -Body $approveExceptionBody -ContentType "application/json"
    Write-Host "  [OK] Exception Approved: $($excRes.message)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Member service check failed: $_" -ForegroundColor Red
}

# 7. E-Card Service - PDF Generation
Write-Host "`n[7/7] Testing E-Card Template & PDF Generation (Port 8086)..." -ForegroundColor Yellow
try {
    $tmpl = Invoke-RestMethod -Uri "$ecardBase/v1/ecards/template-details?insurerId=INS-001&corporateId=CORP-201" -Method Get
    Write-Host "  [OK] Loaded Template: $($tmpl.data.templateName)" -ForegroundColor Green

    $pdfBytes = Invoke-WebRequest -Uri "$ecardBase/v1/ecards/pdf?healthCardNumber=HC-880011&corporateId=CORP-201" -Method Get
    Write-Host "  [OK] E-Card PDF generated successfully! Byte length: $($pdfBytes.Content.Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] E-Card service check failed: $_" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "All MD India Enrollment System Services Tested!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
