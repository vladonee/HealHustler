nt valor1=0;
  int valor2=0;
  int valor3=0;
  int valor4=0;
  int senzor1=A15;
  int senzor2=A14;
  int senzor3=A13;
  int senzor4=A12;

void setup(){
  Serial.begin(9600);

}

void loop(){
  valor1=analogRead(senzor1);
  Serial.println(valor1);
  delay(10);
  valor2=analogRead(senzor2);
  Serial.println(valor2);
  delay(10);
  valor3=analogRead(senzor3);
  Serial.println(valor3);
  delay(10);
  valor4=analogRead(senzor4);
  Serial.println(valor4);
  delay(10);
  if(valor1>200 || valor2>200 || valor3>200 || valor4>200)
    Serial.println("Linie negra");
   else
     Serial.println("Linie alba");
   delay(500);
  }