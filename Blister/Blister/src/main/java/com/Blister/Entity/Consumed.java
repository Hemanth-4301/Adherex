package com.Blister.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Consumed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cid;



    @ManyToOne
    @JoinColumn(name = "m_id") // foreign key column
    private Medication medication;

    private LocalDateTime dateTime;


    public Integer getCid() {
        return cid;
    }

    public void setCid(Integer cid) {
        this.cid = cid;
    }



    public Medication getMedication() {
        return medication;
    }

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}
