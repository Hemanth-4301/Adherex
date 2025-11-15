package com.Blister.Service;



import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(Client client) {
        this.client = client;
    }

    public String generateText(String prompt) {
        // Access models as a field, not a method
        GenerateContentResponse resp = client.models.generateContent(
                "gemini-2.5-flash",  // model name
                prompt,              // prompt / contents
                null                 // optional config (can be null)
        );
        return resp.text();
    }
}
