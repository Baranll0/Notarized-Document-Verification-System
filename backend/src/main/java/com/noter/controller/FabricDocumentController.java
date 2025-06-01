package com.noter.controller;

import com.noter.service.FabricGatewayService;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FabricDocumentController {

    @Autowired
    private FabricGatewayService fabricGatewayService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyDocument(@RequestBody Map<String, String> request) {
        try {
            String documentId = request.get("documentId");
            Gateway gateway = fabricGatewayService.connect();
            Contract contract = fabricGatewayService.getContract(gateway);

            byte[] result = contract.evaluateTransaction("verifyDocument", documentId);
            gateway.close();

            return ResponseEntity.ok(new String(result));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approveDocument(@RequestBody Map<String, String> request) {
        try {
            String documentId = request.get("documentId");
            String status = request.get("status");
            Gateway gateway = fabricGatewayService.connect();
            Contract contract = fabricGatewayService.getContract(gateway);

            byte[] result = contract.submitTransaction("approveDocument", documentId, status);
            gateway.close();

            return ResponseEntity.ok(new String(result));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 