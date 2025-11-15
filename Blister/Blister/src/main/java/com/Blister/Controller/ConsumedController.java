package com.Blister.Controller;

import com.Blister.Entity.Consumed;
import com.Blister.Repository.ConsumedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/consumed")
public class ConsumedController {

    @Autowired
    private ConsumedRepository consumedRepository;

    // GET all consumed records for a patient
    @GetMapping("/bypatient/{p_id}")
    public List<Consumed> getConsumedByPatient(@PathVariable("p_id") Integer p_id) {
        return consumedRepository.findByMedicationPatientPid(p_id);
    }
}