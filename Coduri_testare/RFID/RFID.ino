int RFID_PIN = 17; // Pinul digital la care este conectat modulul RFID

void setup() {
  Serial.begin(9600); // Inițializează comunicarea serială
  pinMode(RFID_PIN, INPUT); // Setează pinul RFID_PIN ca intrare

}
void loop() {
    Serial.println("Așteaptă card RFID...");
  int val=Serial.parseInt();
    if(val>0)
    Serial.println("Detectat");
    delay(1000);
  }

