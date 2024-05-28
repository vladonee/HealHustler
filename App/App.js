import React, { useState }  from 'react';

import { StatusBar } from 'expo-status-bar';
import { View, KeyboardAvoidingView, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import app, { db, db_firestore } from './firebaseConfig';

import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword} from 'firebase/auth';
import {ref, set } from "firebase/database";
import { addDoc, collection } from "firebase/firestore";


const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.text}>HEALhustler</Text>
        <View style={styles.textContainer}>
          <Text style={styles.underText}>MAKING THE WORLD BETTER</Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <View style={styles.button1Container}>
          <Button title="LOG IN" onPress={() => navigation.navigate('LogInScreen')}  color="#378CE7"/>
        </View>

        <View style={styles.button2Container} >
         <Button title="CREATE ACCOUNT" onPress={() => navigation.navigate('CreateAccountScreen')}  color="#000000"/>
        </View>
      </View>

    </View>
  );
};

const LogInScreen = ({ navigation }) => {
  const [textEmail, setText1] = useState('');
  const [textParola, setText2] = useState('');
 
    const [showPassword, setShowPassword] = useState(false); 
  
    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    };

  const auth = getAuth(app);

  const signInUser = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth,textEmail,textParola);
      Alert.alert("Autentificare realizata cu succes!");
      console.log('User signed in!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateButtonPress = () => {
    if(textEmail && textParola)
      {
        signInUser(textEmail,textParola);
        navigation.navigate('ModeScreen');
      }
    else
    {
      Alert.alert("Datele sunt introduse gresit!");
    }
    
  };

  return (
    <View style={styles.container2}>
      <View style={styles.header2}>
        <Text style={styles.text}>HEALhustler</Text>
        <View style={styles.textContainer}>
          <Text style={styles.underText}>MAKING THE WORLD BETTER</Text>
        </View>

        <View style={styles.buttonWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setText1}
            value={textEmail}
            autoCapitalize='none'
          />
          <View style={styles.parola}>
            <TextInput
              secureTextEntry={!showPassword} 
              style={styles.input}
              placeholder="Parola"
              onChangeText={setText2}
              value={textParola}
              autoCapitalize='none'
            />
            <MaterialCommunityIcons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={24} 
                      color="#378CE7"
                      style={styles.icon} 
                      onPress={toggleShowPassword} 
              />
          </View>
        </View>

        <View style={styles.button4Container}>
          <Button title="LOG IN" onPress={handleCreateButtonPress}  color="#378CE7"/>
        </View>
      </View>
      </View>
    </View>
  );
};

const CreateAccountScreen = ({ navigation }) => {
  const [textEmail, setEmail] = useState('');
  const [textNume, setNume] = useState('');
  const [textParola, setParola] = useState('');
  const textPrivilage = "asistenta";

  const [showPassword, setShowPassword] = useState(false); 
  
  const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
  };

  const auth = getAuth(app);

  const registerUser = async () => {
    try {
      await createUserWithEmailAndPassword(auth,textEmail,textParola);
      const response = await signInWithEmailAndPassword(auth,textEmail,textParola);

      set(ref(db, 'users/' + response.user.uid), {
        email: textEmail,
        full_name : textNume,
        privilage: textPrivilage
      })
      .then(() =>{
        Alert.alert('Contul a fost creat cu succes!');
      }
      )
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleCreateButtonPress = () => {
    if(textEmail && textParola && textNume)
      {
        registerUser(auth,textEmail,textParola)
        navigation.navigate('ModeScreen');
      }
      else{
        Alert.alert("Date introduse gresit!");
      }
  };

  return (
    <View style={styles.container2}>
      <View style={styles.header2}>
        <Text style={styles.text}>HEALhustler</Text>
        <View style={styles.textContainer}>
          <Text style={styles.underText}>MAKING THE WORLD BETTER</Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={textEmail}
            autoCapitalize='none'
          />
          <TextInput
            style={styles.input}
            placeholder="Nume complet"
            onChangeText={setNume}
            value={textNume}
          />
          <View style={styles.parola}>
            <TextInput
              secureTextEntry={!showPassword} 
              style={styles.input}
              placeholder="Parola"
              onChangeText={setParola}
              value={textParola}
              autoCapitalize='none'
            />
            <MaterialCommunityIcons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={24} 
                      color="#378CE7"
                      style={styles.icon} 
                      onPress={toggleShowPassword} 
              />
          </View>
        </View>
        

        <View style={styles.button4Container}>
          <Button title="CREATE ACCOUNT" onPress={handleCreateButtonPress}  color="#378CE7"/>
        </View>
      </View>
    </View>
  );
};

const ModeScreen = ({ navigation }) => {


  return(
    <View style={styles.containerMode}> 
      <View style={styles.topBar}>
        <View style={styles.buttonHomeContainer}>
          <Button title={"Exit"} onPress={() => navigation.navigate('Home')}  color="#005b96"/>
        </View>

      </View>

      <View style={styles.headerMode}>
        <Text style={styles.textManualControl}>Mode selection</Text>
      </View>

      <View style={styles.buttonWrapperMode2}>
        <View style={styles.button3Container}>
          <Button title="New transport" onPress={() => navigation.navigate('NewTransportScreen')}  color="#378CE7"/>
        </View>

        <View style={styles.button3Container}>
          <Button title="Manual control" onPress={() => navigation.navigate('ManualControlScreen')}  color="#378CE7"/>
        </View>
      </View>
    </View>
    
  );
};

const NewTransportScreen = ({ navigation }) => {
  const [textNumePacient , setText1] = useState('');
  const [textPrenumePacient, setText2] = useState('');
  const [textCNPPacient, setText3] = useState('');

  const newTransport = async () => {

      try {
        const docRef = await addDoc(collection(db_firestore, "Requests"), {
        CNP: textCNPPacient,
        Nume: textNumePacient,
        Prenume: textPrenumePacient
      });
      Alert.alert("Cerere inregistrata cu id: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }

  const handleRequestButtonPress = () => {
    if(textCNPPacient && textNumePacient && textPrenumePacient)
      {
        newTransport();
        navigation.navigate('ModeScreen');
      }
  };

  return(
    <View style={styles.containerMode}> 
      <View style={styles.topBar}>
        <View style={styles.buttonHomeContainer}>
          <Button title={"Back"} onPress={() => navigation.navigate('ModeScreen')}  color="#005b96"/>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.text}>Transport nou</Text>
      </View>
    
      <View style={styles.buttonWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nume pacient"
            onChangeText={setText1}
            value={textNumePacient}
          />
          <TextInput
            style={styles.input}
            placeholder="Prenume pacient"
            onChangeText={setText2}
            value={textPrenumePacient}
          />
          <TextInput
            style={styles.input}
            placeholder="CNP pacient"
            onChangeText={setText3}
            value={textCNPPacient}
          />
        </View>
        
        <View style={styles.button3Container}>
          <Button title="Trimite cerere" onPress={handleRequestButtonPress}  color="#378CE7"/>
        </View>

      </View>
  </View>
  );
};

const ManualControlScreen = ({ navigation }) => {
  
  return(
    <View style={styles.containerMode}> 
      <View style={styles.topBar}>
        <View style={styles.buttonHomeContainer}>
          <Button title={"Back"} onPress={() => navigation.navigate('ModeScreen')}  color="#005b96"/>
        </View>
      </View>
      <View style={styles.containerMode}>
          <View style={styles.headerManualControl}>
            <Text style={styles.textManualControl}>Manual Control</Text>
          </View>

        <View style={styles.containerMovement}>

            <View style={styles.buttonWrapperM}>
              <View style={styles.buttonContainerM}>
                <Button title={"↑"} onPress={() => navigation.navigate('')}  color="#378CE7"/>
              </View>
            </View>
            
            <View style={styles.buttonWrapperM}>
              <View style={styles.buttonContainerM}>
                <Button title={"←"} onPress={() => navigation.navigate('')}  color="#378CE7"/>
              </View>
              <View style={styles.buttonContainerMiddle}>
                <Button title={" "} color="#378CE7"/>
              </View>
              <View style={styles.buttonContainerM}>
                <Button title={"→"} onPress={() => navigation.navigate('')}  color="#378CE7"/>
              </View>
            </View>

            <View style={styles.buttonWrapperM}>
              <View style={styles.buttonContainerM}>
                <Button title={"↓"} onPress={() => navigation.navigate('')}  color="#378CE7"/>
              </View>
            </View>
        </View>
      </View>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="LogInScreen" component={LogInScreen} options={{ title: 'Log in' }}/>
        <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} options={{ title: 'Create account' }}/>
        <Stack.Screen name="ModeScreen" component={ModeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="NewTransportScreen" component={NewTransportScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ManualControlScreen" component={ManualControlScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  //Home screen
  container: {
    overflow: 'hidden',
    flex: 1,
    backgroundColor: '#EEEDEB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    marginTop: 150,
    alignItems: 'center',
  },
  text: {
    fontSize: 55,
    fontWeight: 'bold',
  },
  textContainer: {
    marginTop: 10,
    width: 300,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#378CE7',
    justifyContent: 'center',
  },
  underText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },

  buttonWrapper: {
    marginTop: -150,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button1Container: {
    marginTop: 20,
    height: 50,
    width: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#378CE7',
    justifyContent: 'center',
  },
  button2Container: {
    marginTop: 20,
    height: 50,
    width: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000000',
    justifyContent: 'center',
  },

  //Input screens stuff(create acc, log in)
  container2: {
    flex: 1,
    backgroundColor: '#EEEDEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header2: {
    marginTop: 62,
    alignItems: 'center',
  },
  inputWrapper: {
    marginTop: 80,
    marginBottom: 40,
  },
  icon: { 
    marginLeft: 10, 
    marginTop: 20,
  },
  parola: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: 300,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  button4Container: {
    marginTop: 50,
    height: 50,
    width: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#378CE7',
    justifyContent: 'center',
  },

  //Mode screen
  containerMode: {
    flex: 1,
    backgroundColor: '#EEEDEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMode: {
    marginTop: 100,
    alignItems: 'center',
  },
  textManualControl: {
    fontSize: 40,
  },
  buttonWrapperMode2: {
    marginTop: -170,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button3Container: {
    marginTop: 40,
    height: 50,
    width: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#378CE7',
    justifyContent: 'center',
  },
  topBar: {
    backgroundColor: '#378CE7',
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonHomeContainer: {
    marginLeft: -280,
    marginTop: 30,
    height: 50,
    width: 70,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },

  //Manual control screen
  
  headerManualControl: {
    marginTop: -200,
    alignItems: 'center',
  },
  containerMovement: {
    marginTop: 100,
  },
  buttonWrapperM: {
    flexDirection: 'row', // Arrange buttons horizontally
    justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center', // Center buttons vertically
    marginVertical: 10, // Add margin between rows
  },
  buttonContainerM: {
    marginHorizontal: 5, // Add margin between buttons
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#378CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainerMiddle: {//Asta e un buton invizibil folosit pentru alinierea celorlalte butoane
    marginHorizontal: 10,
    width: 100,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EEEDEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  TrasportHeaderContainer: {
    marginTop: -200,
    alignItems: 'center',
  }
});

export default App;