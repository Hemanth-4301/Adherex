package com.Blister.Repository;

import com.Blister.Entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient , Integer> {

    boolean existsByEmail(String email);

    Patient findByEmail(String email);

    Patient findByCareTakerEmail(String careTakerEmail);


}
