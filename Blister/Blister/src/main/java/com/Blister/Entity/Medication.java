package com.Blister.Entity;

import jakarta.persistence.*;

@Entity
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mid;

    private String tableName;
    private Integer tabletQty;

    private String timing;
    private String doctor;

    @ManyToOne
    @JoinColumn(name = "p_id") // foreign key column
    private Patient patient;

    public Integer getTabletQty() {
        return tabletQty;
    }

    public void setTabletQty(Integer tabletQty) {
        this.tabletQty = tabletQty;
    }

    public String getTableName() {
        return tableName;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public Integer getMid() {
        return mid;
    }

    public void setMid(Integer mid) {
        this.mid = mid;
    }



    public String getTiming() {
        return timing;
    }

    public void setTiming(String timing) {
        this.timing = timing;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
