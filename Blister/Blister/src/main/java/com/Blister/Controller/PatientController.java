package com.Blister.Controller;

import com.Blister.Entity.Patient;
import com.Blister.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JavaMailSender mailSender;


    // 🔹 Get Patient by ID
    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            return ResponseEntity.ok(optionalPatient.get());
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }


    // 🔹 Register new patient
    @PostMapping("/register")
    public String registerPatient(@RequestBody Patient patient) {
        if (patientRepository.existsByEmail(patient.getEmail())) {
            return "Email already registered!";
        }

        // Save patient first
        patientRepository.save(patient);

        // Sweet message
        String message = String.format(
                "💖 Hello %s,\n\n" +
                        "Welcome to our HealthCare System! 🎉\n" +
                        "We are so happy to have you onboard.\n\n" +
                        "👉 Your login details are:\n" +
                        "Email: %s\n" +
                        "Password: %s\n\n" +
                        "Please keep this safe. If you ever need help, your caretaker %s is here to support you. 🤗\n\n" +
                        "Stay healthy & take care!\n\n💊 Your HealthCare Team",
                patient.getName(),
                patient.getEmail(),
                patient.getPassword(),
                patient.getCareTakerEmail()
        );

        // Send email to patient
        sendEmail(patient.getEmail(), "Welcome to HealthCare! 💖", message);

        // Send email to caretaker
        if (patient.getCareTakerEmail() != null && !patient.getCareTakerEmail().isEmpty()) {
            sendEmail(patient.getCareTakerEmail(), "CareTaker Notification 💌",
                    "Hello CareTaker,\n\nYour patient " + patient.getName() +
                            " has registered successfully.\nHere are their login details:\n" +
                            "Email: " + patient.getCareTakerEmail() + "\n" +
                            "Password: " + patient.getPassword() + "\n\n" +
                            "Please support them with love & care 💖.\n\nThanks,\nHealthCare Team");
        }

        return "Registration successful! Login details sent to patient and caretaker.";
    }

    // Helper method for sending email
    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        mailSender.send(mail);
    }



    // 🔹 Update existing patient by ID
    @PutMapping("/update/{id}")
    public String updatePatient(@PathVariable Integer id, @RequestBody Patient updatedPatient) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();

            // Update only if new values are provided
            if (updatedPatient.getName() != null) patient.setName(updatedPatient.getName());
            if (updatedPatient.getEmail() != null) patient.setEmail(updatedPatient.getEmail());
            if (updatedPatient.getPassword() != null) patient.setPassword(updatedPatient.getPassword());
            if (updatedPatient.getCareTakerEmail() != null) patient.setCareTakerEmail(updatedPatient.getCareTakerEmail());

            patientRepository.save(patient);
            return "Patient updated successfully!";
        } else {
            return "Patient not found!";
        }
    }


    // DTO for login
    public static class LoginRequest {
        public String email;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.email;
        String password = loginRequest.password;

        // ✅ Check if the email belongs to a patient
        Patient patient = patientRepository.findByEmail(email);

        if (patient != null) {
            // Patient login
            if (!patient.getPassword().equals(password)) {
                return ResponseEntity.status(401).body("❌ Invalid password!");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("role", "patient");
            response.put("patient", patient);
            return ResponseEntity.ok(response);
        }

        // ✅ Check if the email belongs to a caretaker
        Patient caretakerOf = patientRepository.findByCareTakerEmail(email);

        if (caretakerOf != null) {
            if (!caretakerOf.getPassword().equals(password)) {
                return ResponseEntity.status(401).body("❌ Invalid password!");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("role", "caretaker");
            response.put("patient", caretakerOf); // includes patient details for caretaker reference
            return ResponseEntity.ok(response);
        }

        // ❌ If not found in either case
        return ResponseEntity.status(404).body("❌ User not found!");
    }



    // 🔹 Set patient alert to true
    @PutMapping("/setAlert/{id}")
    public ResponseEntity<String> setAlertTrue(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setAlert(true);
            patientRepository.save(patient);
            return ResponseEntity.ok("🚨 Alert set to TRUE for patient: " + patient.getName());
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }


    @PutMapping("/clearAlert/{id}")
    public ResponseEntity<String> clearAlert(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setAlert(false);
            patientRepository.save(patient);
            return ResponseEntity.ok("✅ Alert cleared (set to FALSE) for patient: " + patient.getName());
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }


    // UPDATE patient by ID
    @PutMapping("/update/{pid}")
    public ResponseEntity<?> updatePatientprofile(@PathVariable Integer pid, @RequestBody Patient updatedPatient) {
        try {
            Optional<Patient> optionalPatient = patientRepository.findById(pid);
            if (!optionalPatient.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Patient with ID " + pid + " not found");
            }

            Patient patient = optionalPatient.get();

            // Update fields
            patient.setName(updatedPatient.getName());
            patient.setEmail(updatedPatient.getEmail());
            patient.setPassword(updatedPatient.getPassword()); // optional
            patient.setDescription(updatedPatient.getDescription());
            patient.setBp(updatedPatient.getBp());
            patient.setRegularDoctor(updatedPatient.getRegularDoctor());
            patient.setCareTakerEmail(updatedPatient.getCareTakerEmail());

            patientRepository.save(patient);

            return ResponseEntity.ok(patient);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating patient: " + e.getMessage());
        }
    }

}