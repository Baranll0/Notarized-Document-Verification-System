package com.noter.service;

import com.noter.model.Block;
import com.noter.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class BlockchainService {
    private final List<Block> chain = new CopyOnWriteArrayList<>();
    private final List<Transaction> pendingTransactions = new ArrayList<>();
    
    @Value("${blockchain.node.type}")
    private String nodeType;
    
    @Value("${blockchain.node.peers}")
    private String[] peers;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public BlockchainService() {
        // Genesis block oluştur
        chain.add(new Block(0, "0", System.currentTimeMillis(), new ArrayList<>()));
    }

    public Block getLatestBlock() {
        return chain.get(chain.size() - 1);
    }

    public void addTransaction(Transaction transaction) {
        pendingTransactions.add(transaction);
        
        // Eğer yeterli transaction varsa yeni blok oluştur
        if (pendingTransactions.size() >= 5) {
            minePendingTransactions();
        }
        
        // Diğer node'lara bildir
        broadcastTransaction(transaction);
    }

    private void minePendingTransactions() {
        Block latestBlock = getLatestBlock();
        Block newBlock = new Block(
            chain.size(),
            latestBlock.getHash(),
            System.currentTimeMillis(),
            new ArrayList<>(pendingTransactions)
        );
        
        chain.add(newBlock);
        pendingTransactions.clear();
        
        // Diğer node'lara bildir
        broadcastBlock(newBlock);
    }

    private void broadcastTransaction(Transaction transaction) {
        for (String peer : peers) {
            try {
                restTemplate.postForObject(
                    "http://" + peer + "/api/blockchain/transaction",
                    transaction,
                    Void.class
                );
            } catch (Exception e) {
                // Peer'a ulaşılamadı, loglama yapılabilir
            }
        }
    }

    private void broadcastBlock(Block block) {
        for (String peer : peers) {
            try {
                restTemplate.postForObject(
                    "http://" + peer + "/api/blockchain/block",
                    block,
                    Void.class
                );
            } catch (Exception e) {
                // Peer'a ulaşılamadı, loglama yapılabilir
            }
        }
    }

    public List<Block> getChain() {
        return new ArrayList<>(chain);
    }

    public boolean isValid() {
        for (int i = 1; i < chain.size(); i++) {
            Block currentBlock = chain.get(i);
            Block previousBlock = chain.get(i - 1);

            if (!currentBlock.getPreviousHash().equals(previousBlock.getHash())) {
                return false;
            }
        }
        return true;
    }
} 