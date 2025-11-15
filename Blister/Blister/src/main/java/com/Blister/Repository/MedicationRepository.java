package com.Blister.Repository;

import com.Blister.Entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication , Integer> {

    List<Medication> findByPatient_Pid(Integer patientId);

}
