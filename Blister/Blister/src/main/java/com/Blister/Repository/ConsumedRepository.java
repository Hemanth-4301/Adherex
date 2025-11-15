package com.Blister.Repository;

import com.Blister.Entity.Consumed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsumedRepository extends JpaRepository<Consumed , Integer> {

    List<Consumed> findByMedicationPatientPid(Integer pid);

}
