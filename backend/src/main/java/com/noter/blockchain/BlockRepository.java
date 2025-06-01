package com.noter.blockchain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import com.noter.blockchain.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    @Query("SELECT b FROM Block b LEFT JOIN FETCH b.document d LEFT JOIN FETCH d.user u LEFT JOIN FETCH d.noter n")
    List<Block> findAllWithDetails();

    @Query(value = "SELECT b.id as blockId, b.hash, b.previous_hash, b.status, b.timestamp, d.name as documentName, d.hash as documentHash, d.status as documentStatus, d.date as documentDate, u.name as userName, n.name as noterName " +
        "FROM blocks b " +
        "LEFT JOIN documents d ON d.id = b.document_id " +
        "LEFT JOIN users u ON u.id = d.user_id " +
        "LEFT JOIN users n ON n.id = d.noter_id ", nativeQuery = true)
    List<Object[]> findAllBlockDetailsNative();
} 