package com.noter.blockchain;

import java.util.Date;
import com.noter.belge.model.Document;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Entity
@Table(name = "blocks")
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hash;
    private String previousHash;
    private String status; // "ONAYLANDI", "REDDEDILDI", "BEKLEMEDE"
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "blocks"})
    private Document document;

    public Block() {
        // JPA için parametresiz constructor
    }

    public Block(String hash, String previousHash, String status, Date timestamp, Document document) {
        this.hash = hash;
        this.previousHash = previousHash;
        this.status = status;
        this.timestamp = timestamp;
        this.document = document;
    }

    // Getter ve Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public void generateHash() {
        try {
            String data = (previousHash != null ? previousHash : "") +
                          (status != null ? status : "") +
                          (timestamp != null ? timestamp.getTime() : "") +
                          (document != null && document.getId() != null ? document.getId() : "");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            this.hash = Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Hash üretilemedi", e);
        }
    }
} 