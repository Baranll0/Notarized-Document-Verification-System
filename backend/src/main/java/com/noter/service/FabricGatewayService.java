package com.noter.service;

import org.hyperledger.fabric.gateway.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FabricGatewayService {
    
    @Value("${fabric.wallet.path}")
    private String walletPath;
    
    @Value("${fabric.connection.profile}")
    private String connectionProfile;
    
    @Value("${fabric.identity}")
    private String identity;
    
    public Gateway connect() throws Exception {
        // Wallet'ı yükle
        Path walletDir = Paths.get(walletPath);
        Wallet wallet = Wallets.newFileSystemWallet(walletDir);
        
        // Gateway oluştur
        Gateway.Builder builder = Gateway.createBuilder()
                .identity(wallet, identity)
                .networkConfig(Paths.get(connectionProfile))
                .discovery(true);
        
        return builder.connect();
    }
    
    public Contract getContract(Gateway gateway) throws Exception {
        Network network = gateway.getNetwork("mychannel");
        return network.getContract("noter");
    }
} 