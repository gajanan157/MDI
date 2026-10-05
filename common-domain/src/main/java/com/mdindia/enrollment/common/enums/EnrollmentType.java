package com.mdindia.enrollment.common.enums;

public enum EnrollmentType {
    ENROLLMENT,
    ENDORSEMENT;

    public static EnrollmentType fromString(String val) {
        if (val == null) return ENROLLMENT;
        String normalized = val.trim().toUpperCase();
        if (normalized.contains("ENDORSE")) {
            return ENDORSEMENT;
        }
        return ENROLLMENT;
    }
}
