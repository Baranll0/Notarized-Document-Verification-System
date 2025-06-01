package com.noter.smartcontract;

import com.noter.belge.model.Document;
import com.noter.belge.model.User;
import com.noter.blockchain.Block;
import com.noter.blockchain.BlockRepository;
import com.noter.belge.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Optional;

@Service
public class SmartContractService {
    @Autowired
    private BlockRepository blockRepository;
    @Autowired
    private DocumentRepository documentRepository;

    // Noter belgeyi onaylar veya reddeder (Smart Contract mantığı)
    public Document approveDocument(Long documentId, boolean approved, User noter) {
        if (!"noter".equals(noter.getRole())) {
            throw new SecurityException("Sadece noter onay/red işlemi yapabilir!");
        }
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return null;
        Document doc = docOpt.get();
        doc.setStatus(approved ? "Onaylandı" : "Reddedildi");
        doc.setNoter(noter);
        Document updatedDoc = documentRepository.save(doc);
        // Zincire yeni blok ekle (global blockchain mantığı)
        Block lastBlock = blockRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(Block::getId).reversed())
            .findFirst()
            .orElse(null);
        Block block = new Block();
        block.setPreviousHash(lastBlock != null ? lastBlock.getHash() : null);
        block.setStatus(approved ? "ONAYLANDI" : "REDDEDILDI");
        block.setTimestamp(new Date());
        block.setDocument(updatedDoc);
        block.generateHash();
        blockRepository.save(block);
        return updatedDoc;
    }
} 