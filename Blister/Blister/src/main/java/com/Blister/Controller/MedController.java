package com.Blister.Controller;

import com.Blister.Entity.Consumed;
import com.Blister.Entity.Medication;
import com.Blister.Repository.ConsumedRepository;
import com.Blister.Repository.MedicationRepository;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/gemini/medication")
public class MedController {


    @Autowired
    private ConsumedRepository consumedRepository;

    private final MedicationRepository medicationRepository;
    private final Client client;

    public MedController(MedicationRepository medicationRepository,
                         @Value("${gemini.api.key}") String apiKey) {
        this.medicationRepository = medicationRepository;
        // Initialize client
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askAI(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        Integer pid = Integer.parseInt(request.get("pid"));
        Map<String, Object> result = new HashMap<>();

        // Fetch consumed records for the patient
        List<Consumed> consumedList = consumedRepository.findByMedicationPatientPid(pid);

        if (consumedList == null || consumedList.isEmpty()) {
            result.put("aiResponse", "No consumption data found for this patient.");
            return ResponseEntity.ok(result);
        }

        // ✅ Group consumed entries by medication table name
        Map<String, List<Consumed>> groupedByMedication = consumedList.stream()
                .collect(Collectors.groupingBy(c -> c.getMedication().getTableName()));

        // ✅ Build readable summary for the AI prompt
        StringBuilder medsSummary = new StringBuilder("Consumed Medication Details:\n");
        for (Map.Entry<String, List<Consumed>> entry : groupedByMedication.entrySet()) {
            String medName = entry.getKey();
            List<Consumed> meds = entry.getValue();

            if (!meds.isEmpty()) {
                Medication firstMed = meds.get(0).getMedication();
                medsSummary.append("• ")
                        .append(medName)
                        .append(" (Doctor: ").append(firstMed.getDoctor())
                        .append(", Timing: ").append(firstMed.getTiming())
                        .append(")\n   Dates Consumed: ");

                String dates = meds.stream()
                        .map(c -> c.getDateTime().toLocalDate().toString())
                        .sorted()
                        .distinct()
                        .collect(Collectors.joining(", "));
                medsSummary.append(dates).append("\n\n");
            }
        }

        try {
            String fullPrompt = prompt + "\n\n" + medsSummary;

            // 🔹 Call Gemini
            GenerateContentResponse response =
                    client.models.generateContent("gemini-2.0-flash", fullPrompt, null);

            String aiText = response.text();

            result.put("aiResponse", aiText);
            result.put("consumedSummary", medsSummary.toString());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("aiResponse", "Error fetching AI response.");
            result.put("consumedSummary", "");
            return ResponseEntity.status(500).body(result);
        }
    }


}
