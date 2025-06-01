package com.noter.belge.service;

import com.noter.belge.model.Document;
import com.noter.belge.model.User;
import com.noter.belge.repository.DocumentRepository;
import com.noter.belge.repository.UserRepository;
import com.noter.blockchain.Block;
import com.noter.blockchain.BlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import com.noter.belge.dto.DocumentResponse;
import java.util.ArrayList;
import com.noter.belge.dto.BlockResponse;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private BlockRepository blockRepository;
    @Autowired
    private UserRepository userRepository;

    // Belge yükle ve zincire ekle
    public Document uploadDocument(User user, String name, MultipartFile file) throws Exception {
        // 1. Dosya hash'i üret (IPFS yoksa SHA-256 ile)
        String hash = "";
        if (file != null) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(file.getBytes());
            hash = Base64.getEncoder().encodeToString(hashBytes);
        }
        // 2. Document kaydı oluştur
        Document doc = new Document();
        doc.setName(name);
        doc.setHash(hash);
        doc.setStatus("Onay Bekliyor");
        doc.setDate(new Date());
        doc.setUser(user);
        doc.setNoter(null);
        Document savedDoc = documentRepository.save(doc);
        // 3. Zincire blok ekle (global blockchain mantığı)
        Block block = new Block();
        block.setHash(hash);
        // En son eklenen bloğu ID'ye göre bul (gerçek blockchain mantığı)
        Block lastBlock = blockRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(Block::getId).reversed())
            .findFirst()
            .orElse(null);
        block.setPreviousHash(lastBlock != null ? lastBlock.getHash() : null);
        block.setStatus("BEKLEMEDE");
        block.setTimestamp(new Date());
        block.setDocument(savedDoc);
        block.generateHash();
        blockRepository.save(block);
        return savedDoc;
    }

    public List<Document> getPendingDocuments() {
        return documentRepository.findAll().stream()
            .filter(doc -> "Onay Bekliyor".equals(doc.getStatus()))
            .toList();
    }

    public List<Document> getDocumentsByUser(User user) {
        return documentRepository.findByUser(user);
    }

    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public List<DocumentResponse> getDocumentsByNoter(User noter) {
        List<Document> docs = documentRepository.findByNoter(noter);
        List<DocumentResponse> resp = new ArrayList<>();
        for (Document d : docs) {
            DocumentResponse dr = new DocumentResponse();
            dr.id = d.getId();
            dr.name = d.getName();
            dr.hash = d.getHash();
            dr.status = d.getStatus();
            dr.date = d.getDate();
            dr.userId = d.getUser() != null ? d.getUser().getId() : null;
            resp.add(dr);
        }
        return resp;
    }

    public List<DocumentResponse> getAllDocuments() {
        List<Document> docs = documentRepository.findAll();
        List<DocumentResponse> resp = new ArrayList<>();
        for (Document d : docs) {
            DocumentResponse dr = new DocumentResponse();
            dr.id = d.getId();
            dr.name = d.getName();
            dr.hash = d.getHash();
            dr.status = d.getStatus();
            dr.date = d.getDate();
            dr.userId = d.getUser() != null ? d.getUser().getId() : null;
            resp.add(dr);
        }
        return resp;
    }

    public List<BlockResponse> getAllBlocksWithDetails() {
        List<Block> blocks = blockRepository.findAllWithDetails();
        List<BlockResponse> resp = new ArrayList<>();
        for (Block b : blocks) {
            BlockResponse br = new BlockResponse();
            br.id = b.getId();
            br.hash = b.getHash();
            br.previousHash = b.getPreviousHash();
            br.status = b.getStatus();
            br.timestamp = b.getTimestamp();
            if (b.getDocument() != null) {
                br.documentId = b.getDocument().getId();
                br.documentName = b.getDocument().getName();
                br.documentHash = b.getDocument().getHash();
                br.documentStatus = b.getDocument().getStatus();
                br.documentDate = b.getDocument().getDate();
                if (b.getDocument().getUser() != null) {
                    br.userId = b.getDocument().getUser().getId();
                    br.userName = b.getDocument().getUser().getName();
                }
                if (b.getDocument().getNoter() != null) {
                    br.noterId = b.getDocument().getNoter().getId();
                    br.noterName = b.getDocument().getNoter().getName();
                }
            }
            resp.add(br);
        }
        return resp;
    }

    public List<BlockResponse> getAllBlocksDirectFromDb() {
        List<Object[]> rows = blockRepository.findAllBlockDetailsNative();
        List<BlockResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            BlockResponse br = new BlockResponse();
            br.id = row[0] != null ? ((Number) row[0]).longValue() : null;
            br.hash = (String) row[1];
            br.previousHash = (String) row[2];
            br.status = (String) row[3];
            br.timestamp = row[4] != null ? (java.sql.Timestamp) row[4] : null;
            br.documentName = (String) row[5];
            br.documentHash = (String) row[6];
            br.documentStatus = (String) row[7];
            br.documentDate = row[8] != null ? (java.sql.Timestamp) row[8] : null;
            br.userName = (String) row[9];
            br.noterName = (String) row[10];
            result.add(br);
        }
        return result;
    }

    private BlockResponse convertToBlockResponse(Block block) {
        BlockResponse br = new BlockResponse();
        br.timestamp = block.getTimestamp();
        br.hash = block.getHash();
        br.previousHash = block.getPreviousHash();
        return br;
    }
} 