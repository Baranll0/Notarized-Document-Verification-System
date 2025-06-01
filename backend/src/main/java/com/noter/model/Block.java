package com.noter.model;

import lombok.Data;
import java.util.List;

@Data
public class Block {
    private int index;
    private String previousHash;
    private long timestamp;
    private List<Transaction> transactions;
    private String hash;

    public Block(int index, String previousHash, long timestamp, List<Transaction> transactions) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = calculateHash();
    }

    public String calculateHash() {
        return String.format("%s-%d-%s-%s",
            previousHash,
            timestamp,
            transactions.toString(),
            index
        );
    }

    public String getHash() {
        return hash;
    }

    public String getPreviousHash() {
        return previousHash;
    }
} 