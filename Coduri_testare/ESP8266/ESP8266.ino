#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ESP8266HTTPClient.h>

// Initialise NodeMCU to Arduino (D2=Rx & D3=Tx)
SoftwareSerial nodemcu(D2, D3);

const char* ssid = "TPLINK2031";
const char* password = "12344321";
const char* mqtt_server = "test.mosquitto.org"; // Adresa IP a serverului MQTT
const int mqtt_port = 1883; // Portul pe care rulează serverul MQTT
const char* serverAddress = "172.20.10.1"; // Adresa IP a serverului HTTP
const int serverPort = 3000; // Portul pe care rulează serverul HTTP
const char* clientID = "ESP8266Client-1"; // Identificator unic pentru clientul MQTT

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() { // configurare Wifi
  delay(10);
  // Serial.println();
  // Serial.print("Connecting to ");
  // Serial.println(ssid);   cod pentru debugging
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int max_attempts = 20;
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < max_attempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi conectat!");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.println("Conectarea la WiFi a esuat!");
  }
}

void handleStartMedicineTransport(String bedNumber, String corridor, String roomNumber) { // afiseaza cele 3 date mentionata
  // Your function implementation here
  Serial.print("Transport pentru Pat: ");
  Serial.print(bedNumber);
  Serial.print(", Corridor: ");
  Serial.print(corridor);
  Serial.print(", Camera: ");
  Serial.println(roomNumber);
}

void callback(char* topic, byte* payload, unsigned int length) { //trimitere inapoi la node.js
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  StaticJsonDocument<200> jsonDoc;
  DeserializationError error = deserializeJson(jsonDoc, message);
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  String bedNumber = jsonDoc["Patient_Bed_Number"];
  String corridor = jsonDoc["Patient_Corridor"];
  String roomNumber = jsonDoc["Patient_Room_Number"];

  handleStartMedicineTransport(bedNumber, corridor, roomNumber);
}

void reconnect() { // reconectare la MQTT
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(clientID)) {
      Serial.println("connected");
      if (client.subscribe("robot/commands")) {
        Serial.println("Subscriptie cu succes!");
      } else {
        Serial.println("Subscriptia a esuat!");
      }
    } else {
      Serial.print("conexiunea MQTT a esuat, rc=");
      Serial.print(client.state());
      Serial.println(". Incearca peste 5 secunde");
      delay(5000);
    }
  }
}

void sendDeliveryStatus(String message) { //trimite mesajul de livrare de la robot
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(espClient, String("http://") + serverAddress + ":" + serverPort + "/delivery-successful");
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> jsonDoc;
    if(message == "Robotul este blocat"){
    jsonDoc["status"] = "Robotul este blocat";
    }
    else{
      jsonDoc["status"] = "Robotul a ajuns";
    }
    String jsonString;
    serializeJson(jsonDoc, jsonString);

    int httpCode = http.POST(jsonString);
    if (httpCode > 0) {
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Mesajul de la robot a fost trimis cu succes!");
        Serial.println(payload);
      }
    } else {
      Serial.printf("POST-ul a esuat , eroarea: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi nu este conectat");
  }
}

void setup() { 
  Serial.begin(9600);
  nodemcu.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  reconnect(); 
}

void loop() {
  if (!client.connected()) {
    Serial.println("MQTT client s-a deconectat. Se reconecteaza...");
    reconnect();
  }
  client.loop();

  if (nodemcu.available()) {
    String message = nodemcu.readStringUntil('\n');
    message.trim();
    if ((message == "Robotul a ajuns") ||(message=="Robotul este blocat")) {
      sendDeliveryStatus(message);
    }
  }
  
  delay(100);
}