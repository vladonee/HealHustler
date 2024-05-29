#include <string.h>

String DEJU = "2003A131338";
String POPESCU = "2003A0E92A4";
String ORDU = "4004F0BE5F5";

boolean rfidDetected=false;

void setup() {

  // initialize both serial ports:

  Serial.begin(9600);

  Serial2.begin(9600);
}

void loop() {

  // read from port 1, send to port 0:

  if (Serial2.available()) {
    String rfidData = Serial2.readStringUntil('\n');  // Citim datele de la RFID
    rfidData.trim();
     if (rfidData.indexOf(ORDU) != -1)
     {
          rfidDetected = true;
          Serial.println("ORDU");
           String rfidData = Serial2.readStringUntil('\n');  // Citim datele de la RFID 
     }
     else if(rfidData.indexOf(POPESCU) != -1){
          rfidDetected = true;
          String rfidData = Serial2.readStringUntil('\n');  // Citim datele de la RFID
          Serial.println("POPESCU"); 
     }
     else if(rfidData.indexOf(DEJU) != -1){
          rfidDetected = true;
          Serial.println("DEJU");
          String rfidData = Serial2.readStringUntil('\n');  // Citim datele de la RFID 
      }
      else {
          rfidDetected = false;
          Serial.println("Unknown RFID:");  // Mesaj de debugging
        }  }  
}