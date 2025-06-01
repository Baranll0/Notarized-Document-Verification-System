package com.noter.belge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.noter.belge", "com.noter.service", "com.noter.blockchain"})
@EnableJpaRepositories(basePackages = {"com.noter.belge.repository", "com.noter.blockchain"})
@EntityScan(basePackages = {"com.noter.belge.model", "com.noter.blockchain"})
public class BelgeBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BelgeBackendApplication.class, args);
    }
} 