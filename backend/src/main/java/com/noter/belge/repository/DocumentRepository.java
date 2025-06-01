package com.noter.belge.repository;

import com.noter.belge.model.Document;
import com.noter.belge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);
    List<Document> findByNoter(User noter);
} 