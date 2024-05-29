#include <Wire.h>
#include <QTRSensors.h>
#include <NewPing.h>
#include <SPI.h>
#include <SoftwareSerial.h>

#define MAX_DISTANCE 200

SoftwareSerial BluetoothSerial(2, 4);  // RX, TX pentru modulul Bluetooth

int distance;
int v_snz_stanga;
int v_snz_stanga_mij;
int v_snz_dreapta_mij;
int v_snz_dreapta;

const int MOTOR2_PIN1 = 3;
const int MOTOR2_PIN2 = 5;
const int MOTOR1_PIN1 = 6;
const int MOTOR1_PIN2 = 9;

const int senzor_stanga = A15;
const int senzor_stanga_mijloc = A14;
const int senzor_dreapta_mijloc = A13;
const int senzor_dreapta = A12;

const int TRIGGER_PIN = 31;
const int ECHO_PIN = 30;

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

bool manualMode = false;
bool hold_on = false;
bool rfidDetected = false;

const int threshold = 200;  // Pragul pentru citirile senzorilor
const int tolerance = 10;   // Toleranța pentru a considera că robotul este pe linie

void setup() {
  Serial.begin(9600);
  // Serial1.begin(9600);
  Serial2.begin(9600);
  BluetoothSerial.begin(9600);
  pinMode(MOTOR1_PIN1, OUTPUT);
  pinMode(MOTOR1_PIN2, OUTPUT);
  pinMode(MOTOR2_PIN1, OUTPUT);
  pinMode(MOTOR2_PIN2, OUTPUT);
}

void loop() {
  if (BluetoothSerial.available()) {
    char command = BluetoothSerial.read();
    handleBluetoothCommand(command);
  } else {
    if (!manualMode) {
      v_snz_stanga = analogRead(senzor_stanga);
      v_snz_stanga_mij = analogRead(senzor_stanga_mijloc);
      v_snz_dreapta_mij = analogRead(senzor_dreapta_mijloc);
      v_snz_dreapta = analogRead(senzor_dreapta);
      distance = checkdistance();
      // if(Serial1.available())
      // {
      //   int bedNumber = Serial1.parseInt();
      //   int corridor = Serial1.parseInt();
      //   int roomNumber = Serial1.parseInt();
      // }
      
        if (distance > 5) {
          followLine(distance);
        } else {
          stop_moving();
          // Serial1.println("Robotul este blocat");
           // Apelați funcția de redresare pe linia neagră în caz de blocare
        }
      
    }
  }

  // Verificăm dacă sunt disponibile date de la RFID
  if (Serial2.available()) {
    String rfidData = Serial2.readStringUntil('\n');  // Citim datele de la RFID
    rfidData.trim();
    if (rfidData.indexOf("4004F0BE5F5") != -1) {
      rfidDetected = true;
      Serial2.println("ORDU");
    } else if (rfidData.indexOf("2003A0E92A4") != -1) {
      rfidDetected = true;
      Serial2.println("POPESCU");
    } else if (rfidData.indexOf("2003A131338") != -1) {
      rfidDetected = true;
      Serial2.println("DEJU");
    } else {
      rfidDetected = false;
      Serial2.println("Unknown RFID:");  // Mesaj de debugging
    }
  }
}

void stop_moving() {
  analogWrite(MOTOR1_PIN1, 0);
  analogWrite(MOTOR1_PIN2, 0);
  analogWrite(MOTOR2_PIN1, 0);
  analogWrite(MOTOR2_PIN2, 0);
}

void go_forward(int speed) {
  analogWrite(MOTOR1_PIN1, speed);
  analogWrite(MOTOR1_PIN2, 0);
  analogWrite(MOTOR2_PIN1, speed);
  analogWrite(MOTOR2_PIN2, 0);
}

void go_backwards(int speed) {
  analogWrite(MOTOR1_PIN1, 0);
  analogWrite(MOTOR1_PIN2, speed);
  analogWrite(MOTOR2_PIN1, 0);
  analogWrite(MOTOR2_PIN2, speed);
}

void take_right(int speed) {
  analogWrite(MOTOR1_PIN1, 0);
  analogWrite(MOTOR1_PIN2, speed);
  analogWrite(MOTOR2_PIN1, 0);
  analogWrite(MOTOR2_PIN2, 0);
}

void take_left(int speed) {
  analogWrite(MOTOR1_PIN1, 0);
  analogWrite(MOTOR1_PIN2, 0);
  analogWrite(MOTOR2_PIN1, 0);
  analogWrite(MOTOR2_PIN2, speed);
}

int checkdistance() {
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);
  int distance = pulseIn(ECHO_PIN, HIGH) / 58.00;
  //Serial.println(distance);
  delay(10);
  return distance;
}

void followLine(int distance) {
  
  if(distance>5){
  int error = 0;
  if (v_snz_stanga < threshold) error -= 3;
  if (v_snz_stanga_mij < threshold) error -= 1;
  if (v_snz_dreapta_mij < threshold) error += 1;
  if (v_snz_dreapta < threshold) error += 3;
  if (v_snz_stanga > threshold && v_snz_stanga_mij < threshold && v_snz_dreapta_mij < threshold && v_snz_dreapta < threshold) 
    {take_left(75);
      delay(200);
    }
  if (v_snz_stanga < threshold && v_snz_stanga_mij < threshold && v_snz_dreapta_mij < threshold && v_snz_dreapta > threshold) 
    {take_right(75);
     delay(200);
    }
  // Verificăm dacă toate valorile senzorilor sunt mai mici decât pragul
  if (v_snz_stanga < threshold && v_snz_stanga_mij < threshold && v_snz_dreapta_mij < threshold && v_snz_dreapta < threshold) {
    realignOnLine();
    return;
  }

  int baseSpeed = 75; // Viteza de bază
  int turnSpeed = error * 25; // Ajustăm factorul proporțional după cum e necesar

  int leftSpeed, rightSpeed;

  if (error == 0) {
    leftSpeed = baseSpeed - 25;
    rightSpeed = baseSpeed - 25;
  } else if (error > 0) {
    leftSpeed = baseSpeed - turnSpeed - 10; // Scădem o mică valoare pentru a face compensație
    rightSpeed = baseSpeed + turnSpeed + 20; // Adăugăm o valoare mai mare pentru a corecta direcția spre dreapta
  } else {
    leftSpeed = baseSpeed - turnSpeed + 20; // Adăugăm o valoare mai mare pentru a corecta direcția spre stânga
    rightSpeed = baseSpeed + turnSpeed - 10; // Scădem o mică valoare pentru a face compensație
  }

  analogWrite(MOTOR1_PIN1, rightSpeed);
  analogWrite(MOTOR1_PIN2, 0);
  analogWrite(MOTOR2_PIN1, leftSpeed);
  analogWrite(MOTOR2_PIN2, 0);
  }
}

void handleBluetoothCommand(char command) {
  switch (command) {
    case 'F':  // Forward
      manualMode = true;
      go_forward(150);
      break;
    case 'B':  // Backwards
      manualMode = true;
      go_backwards(150);
      break;
    case 'L':  // Left
      manualMode = true;
      take_left(150);
      break;
    case 'R':  // Right
      manualMode = true;
      take_right(150);
      break;
    case 'S':  // Stop
      manualMode = true;
      stop_moving();
      break;
    case 'A':  // Automatic mode
      manualMode = false;
      stop_moving();
      break;
    default:
      // nu face nimic
      break;
  }
}

void realignOnLine() {
  // Realignarea robotului pe linia neagră după blocare

  // Oprirea robotului
  stop_moving();

  // Mergem înapoi puțin
  go_backwards(75);
  delay(500);
  if (v_snz_stanga >= threshold || v_snz_stanga_mij >= threshold || v_snz_dreapta_mij >= threshold || v_snz_dreapta >= threshold)
  exit(0);

  delay(500);
    if (v_snz_stanga >= threshold || v_snz_stanga_mij >= threshold || v_snz_dreapta_mij >= threshold || v_snz_dreapta >= threshold)
  exit(0);

  // Mergem înainte
  go_forward(100);
  delay(500);

  // Oprirea robotului
  stop_moving();

  // Revenim la modul automat
  manualMode = false;
}