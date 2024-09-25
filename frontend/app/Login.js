import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () =>{
    const[username, setUsername]=useState('');
    const[password, setPassword]=useState('');
    const navigation = useNavigation();
    
    const handleLogin = async()=>{
        try{
            const response= await fetch('http://127.0.0.1:8080/login',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({username,password}),
            });
            const data = await response.json()
            if (response.ok) {
              console.log("logged in", data);
              await AsyncStorage.setItem('username', username);
              Alert.alert('Success', 'logged-in successfully');
              navigation.navigate('Dashboard');
                
        
        }else {
            Alert.alert('Error', data.message || 'An error occurred');
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'An error occurred. Please try again later.');
        }
    };
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <Button title="Login" onPress={handleLogin} />
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
      },
      title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
      },
      input: {
        borderWidth: 1,
        padding: 8,
        marginVertical: 8,
      },
    });
    
    export default Login;