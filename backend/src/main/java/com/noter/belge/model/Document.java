package com.noter.belge.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String hash;
    private String status; // "Onay Bekliyor", "Onaylandı", "Reddedildi"
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "noter_id")
    private User noter; // Onaylayan noter

    // Getter ve Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public User getNoter() { return noter; }
    public void setNoter(User noter) { this.noter = noter; }
} 