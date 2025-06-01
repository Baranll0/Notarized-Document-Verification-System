package com.noter.controller;

import com.noter.model.Block;
import com.noter.model.Transaction;
import com.noter.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/chain")
    public ResponseEntity<List<Block>> getChain() {
        return ResponseEntity.ok(blockchainService.getChain());
    }

    @PostMapping("/transaction")
    public ResponseEntity<Void> addTransaction(@RequestBody Transaction transaction) {
        blockchainService.addTransaction(transaction);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/block")
    public ResponseEntity<Void> addBlock(@RequestBody Block block) {
        // Bu endpoint diğer node'lardan gelen blokları almak için kullanılır
        // Gerçek uygulamada burada daha fazla doğrulama yapılmalıdır
        return ResponseEntity.ok().build();
    }

    @GetMapping("/valid")
    public ResponseEntity<Boolean> isValid() {
        return ResponseEntity.ok(blockchainService.isValid());
    }
} 