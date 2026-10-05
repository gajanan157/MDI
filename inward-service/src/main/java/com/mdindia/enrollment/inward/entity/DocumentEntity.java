package com.mdindia.enrollment.inward.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inward_documents")
public class DocumentEntity {

    @Id
    private String fileMetadataId;

    private String inwardNo;
    private String fileName;
    private String documentType;
    private String s3BucketName;
    private String s3SubBucketName;
    private Long fileSize;
    private String contentType;
    private String downloadUrl;
    private LocalDateTime createdAt;

    public DocumentEntity() {}

    public DocumentEntity(String fileMetadataId, String inwardNo, String fileName, String documentType,
                          String s3BucketName, String s3SubBucketName, Long fileSize, String contentType,
                          String downloadUrl, LocalDateTime createdAt) {
        this.fileMetadataId = fileMetadataId;
        this.inwardNo = inwardNo;
        this.fileName = fileName;
        this.documentType = documentType;
        this.s3BucketName = s3BucketName;
        this.s3SubBucketName = s3SubBucketName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.downloadUrl = downloadUrl;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String fileMetadataId;
        private String inwardNo;
        private String fileName;
        private String documentType;
        private String s3BucketName;
        private String s3SubBucketName;
        private Long fileSize;
        private String contentType;
        private String downloadUrl;
        private LocalDateTime createdAt;

        public Builder fileMetadataId(String id) { this.fileMetadataId = id; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder fileName(String fn) { this.fileName = fn; return this; }
        public Builder documentType(String dt) { this.documentType = dt; return this; }
        public Builder s3BucketName(String bn) { this.s3BucketName = bn; return this; }
        public Builder s3SubBucketName(String sbn) { this.s3SubBucketName = sbn; return this; }
        public Builder fileSize(Long fs) { this.fileSize = fs; return this; }
        public Builder contentType(String ct) { this.contentType = ct; return this; }
        public Builder downloadUrl(String du) { this.downloadUrl = du; return this; }
        public Builder createdAt(LocalDateTime ca) { this.createdAt = ca; return this; }

        public DocumentEntity build() {
            return new DocumentEntity(fileMetadataId, inwardNo, fileName, documentType, s3BucketName, s3SubBucketName, fileSize, contentType, downloadUrl, createdAt);
        }
    }

    public String getFileMetadataId() { return fileMetadataId; }
    public void setFileMetadataId(String fileMetadataId) { this.fileMetadataId = fileMetadataId; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getS3BucketName() { return s3BucketName; }
    public void setS3BucketName(String s3BucketName) { this.s3BucketName = s3BucketName; }
    public String getS3SubBucketName() { return s3SubBucketName; }
    public void setS3SubBucketName(String s3SubBucketName) { this.s3SubBucketName = s3SubBucketName; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
