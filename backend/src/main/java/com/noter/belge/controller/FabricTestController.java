package com.noter.belge.controller;

import com.noter.belge.service.FabricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/test/fabric")
public class FabricTestController {
    @Autowired
    private FabricService fabricService;

    // Zincire örnek belge ekle
    @PostMapping("/create")
    public String createDoc(@RequestParam String hash, @RequestParam String owner, @RequestParam String timestamp) {
        fabricService.createDocument(hash, owner, timestamp);
        return "Zincire eklendi: " + hash;
    }

    // Zincirden belge geçmişini getir
    @GetMapping("/history")
    public List<String> getHistory(@RequestParam String hash) {
        return fabricService.getDocumentHistory(hash);
    }
} 