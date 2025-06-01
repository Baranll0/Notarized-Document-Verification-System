package com.noter.belge.service;

import org.hyperledger.fabric.gateway.*;
import org.springframework.stereotype.Service;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.ArrayList;

@Service
public class FabricService {
    // Bu örnek, gerçek Fabric SDK entegrasyonu için iskelet sağlar.
    // Gerçek ortamda: cüzdan, network config, kimlik yönetimi gerekir.

    private static final String CHANNEL_NAME = "mychannel";
    private static final String CHAINCODE_NAME = "document";
    private static final String CONNECTION_PROFILE = "src/main/resources/connection-org1.yaml";
    private static final String WALLET_PATH = "src/main/resources/wallet";
    private static final String USER_ID = "admin";

    private Contract getContract() throws Exception {
        Path walletPath = Paths.get(WALLET_PATH);
        Wallet wallet = Wallets.newFileSystemWallet(walletPath);
        Gateway.Builder builder = Gateway.createBuilder()
                .identity(wallet, USER_ID)
                .networkConfig(Paths.get(CONNECTION_PROFILE));
        Gateway gateway = builder.connect();
        Network network = gateway.getNetwork(CHANNEL_NAME);
        return network.getContract(CHAINCODE_NAME);
    }

    public void createDocument(String hash, String owner, String timestamp) {
        try {
            Contract contract = getContract();
            contract.submitTransaction("CreateDocument", hash, owner, timestamp);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void approveDocument(String hash, String noter, boolean approved) {
        try {
            Contract contract = getContract();
            contract.submitTransaction("ApproveDocument", hash, noter, String.valueOf(approved));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<String> getDocumentHistory(String hash) {
        List<String> history = new ArrayList<>();
        try {
            Contract contract = getContract();
            byte[] result = contract.evaluateTransaction("GetDocumentHistory", hash);
            // Sonucu JSON parse edip dönebilirsin
            history.add(new String(result));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return history;
    }
} 