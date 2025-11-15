package com.Blister.Controller;

import com.Blister.Entity.Medication;
import com.Blister.Entity.Patient;
import com.Blister.Repository.MedicationRepository;
import com.Blister.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/medications")
public class MedicationController {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private PatientRepository patientRepository;




    // ✅ POST - Add a medication for a patient
    @PostMapping("/add/{patientId}")
    public String addMedication(@PathVariable Integer patientId, @RequestBody Medication medication) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return "Patient not found with ID: " + patientId;
        }
        Patient patient = patientOpt.get();
        medication.setPatient(patient);
        medicationRepository.save(medication);
        return "Medication added successfully for patient: " + patient.getName();
    }

    // ✅ GET - Get all medications by patient ID
    @GetMapping("/get/patient/{patientId}")
    public List<Medication> getMedicationsByPatientId(@PathVariable Integer patientId) {
        return medicationRepository.findByPatient_Pid(patientId);
    }

    // ✅ PUT - Update an existing medication
    @PutMapping("/update/{mid}")
    public String updateMedication(@PathVariable Integer mid, @RequestBody Medication updatedMedication) {
        Optional<Medication> existingMedOpt = medicationRepository.findById(mid);
        if (existingMedOpt.isEmpty()) {
            return "Medication not found with ID: " + mid;
        }

        Medication existingMed = existingMedOpt.get();

        // Update only provided fields
        if (updatedMedication.getTableName() != null)
            existingMed.setTableName(updatedMedication.getTableName());
        if (updatedMedication.getTabletQty() != null)
            existingMed.setTabletQty(updatedMedication.getTabletQty());
//        if (updatedMedication.getTabletConsumed() != null)
//            existingMed.setTabletConsumed(updatedMedication.getTabletConsumed());
        if (updatedMedication.getTiming() != null)
            existingMed.setTiming(updatedMedication.getTiming());
        if (updatedMedication.getDoctor() != null)
            existingMed.setDoctor(updatedMedication.getDoctor());

        medicationRepository.save(existingMed);
        return "Medication updated successfully (ID: " + mid + ")";
    }

    @DeleteMapping("/delete/{mid}")
    public String deleteMedication(@PathVariable Integer mid) {
        if (!medicationRepository.existsById(mid)) {
            return "Medication not found with ID: " + mid;
        }
        medicationRepository.deleteById(mid);
        return "Medication deleted successfully (ID: " + mid + ")";
    }




}
