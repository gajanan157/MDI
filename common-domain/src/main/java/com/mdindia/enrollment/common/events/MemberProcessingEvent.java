package com.mdindia.enrollment.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberProcessingEvent {
    private String eventId;
    private String inwardNo;
    private String policyId;
    private String policyNumber;
    private String endorsementId;
    private String documentType;
    private String s3BucketName;
    private String s3Key;
    private Instant triggeredAt;
}
