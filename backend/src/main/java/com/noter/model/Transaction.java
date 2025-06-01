package com.noter.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Transaction {
    private String id;
    private String documentId;
    private String userId;
    private String noterId;
    private String type; // UPLOAD, APPROVE, REJECT
    private String status;
    private LocalDateTime timestamp;
    private String data; // JSON formatında ek veri

    public Transaction() {
        this.id = java.util.UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
    }
} 