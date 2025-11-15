
#include <WiFi.h>
#include <PubSubClient.h>

// ---------------- WiFi Credentials ----------------
const char* ssid = "Cpfloor2gjio";
const char* password = "ZonalAccess77";

// ---------------- MQTT Broker Details ----------------
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "medicalblister";

// ---------------- Pins and Variables ----------------
int fsrPin = 36;      // FSR connected to analog pin 36 (ADC1_0)
int fsrReading = 0;
int ledPin = 4;

// ---------------- WiFi and MQTT Client Setup ----------------
WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Reconnect to MQTT if disconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32MedicalBlisterClient")) {
      Serial.println("connected!");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  fsrReading = analogRead(fsrPin);
  Serial.print("FSR Reading: ");
  Serial.println(fsrReading);

  if (fsrReading > 50) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Pressed");
    client.publish(mqtt_topic, "p");  // <-- Send "p" to topic medicalblister
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("Not Pressed");
  }

  delay(200); // Small delay
}