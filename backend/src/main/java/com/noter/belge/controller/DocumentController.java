package com.noter.belge.controller;

import com.noter.belge.model.Document;
import com.noter.belge.model.User;
import com.noter.belge.repository.UserRepository;
import com.noter.belge.service.DocumentService;
import com.noter.belge.dto.DocumentResponse;
import com.noter.belge.dto.BlockResponse;
import com.noter.blockchain.BlockRepository;
import com.noter.blockchain.Block;
import com.noter.smartcontract.SmartContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin
public class DocumentController {
    @Autowired
    private DocumentService documentService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BlockRepository blockRepository;
    @Autowired
    private SmartContractService smartContractService;

    // Belge yükleme (userId parametre ile)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadDocument(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam("file") MultipartFile file
    ) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Kullanıcı bulunamadı");
        }
        try {
            // Eğer name boşsa dosyanın orijinal adını kullan
            if (name == null || name.isBlank()) {
                name = file.getOriginalFilename();
            }
            Document doc = documentService.uploadDocument(userOpt.get(), name, file);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Belge yüklenemedi: " + e.getMessage());
        }
    }

    // Noter: Bekleyen tüm belgeleri getir
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingDocuments() {
        return ResponseEntity.ok(documentService.getPendingDocuments());
    }

    // Noter: Belgeyi onayla veya reddet
    @PostMapping("/approve")
    public ResponseEntity<?> approveDocument(@RequestParam Long id, @RequestParam boolean approved, org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User noter = userRepository.findByEmail(email).orElse(null);
        if (noter == null || !"noter".equals(noter.getRole())) {
            return ResponseEntity.status(403).body("Sadece noterler onay/red işlemi yapabilir");
        }
        Document updated = smartContractService.approveDocument(id, approved, noter);
        if (updated == null) return ResponseEntity.badRequest().body("Belge bulunamadı");
        return ResponseEntity.ok(updated);
    }

    // Kullanıcının yüklediği belgeleri getir
    @GetMapping
    public ResponseEntity<?> getDocumentsByUser(@RequestParam("userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("Kullanıcı bulunamadı");
        return ResponseEntity.ok(documentService.getDocumentsByUser(userOpt.get()));
    }

    @GetMapping("/my-decisions")
    public ResponseEntity<?> getMyDecisions(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User noter = userRepository.findByEmail(email).orElse(null);
        if (noter == null || !"noter".equals(noter.getRole())) {
            return ResponseEntity.status(403).body("Sadece noterler kendi geçmiş kararlarını görebilir");
        }
        return ResponseEntity.ok(documentService.getDocumentsByNoter(noter));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/blocks/all")
    public ResponseEntity<?> getAllBlocks() {
        return ResponseEntity.ok(documentService.getAllBlocksWithDetails());
    }

    @GetMapping("/blocks/direct")
    public ResponseEntity<?> getAllBlocksDirect() {
        return ResponseEntity.ok(documentService.getAllBlocksDirectFromDb());
    }

    @GetMapping("/blocks/raw")
    public ResponseEntity<?> getAllBlocksRaw() {
        return ResponseEntity.ok(blockRepository.findAll());
    }

    @GetMapping("/admin/transactions")
    public ResponseEntity<?> getAllTransactionsForAdmin(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"admin".equals(admin.getRole())) {
            return ResponseEntity.status(403).body("Sadece adminler görebilir");
        }
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/admin/blocks-with-details")
    public ResponseEntity<?> getAllBlocksWithDetailsForAdmin(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"admin".equals(admin.getRole())) {
            return ResponseEntity.status(403).body("Sadece adminler görebilir");
        }
        return ResponseEntity.ok(documentService.getAllBlocksWithDetails());
    }
} 