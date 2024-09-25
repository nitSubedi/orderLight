import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState,useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = ()=>{

    const[orderID,setOrderID]=useState('');
    const[status,setStatus]=useState('');
    const[hue_id,sethue_id]=useState('');
    const[hue_username,sethue_username]=useState('');
    const[light_id,setlight_id]=useState('');
    const[username,setUsername]=useState('');
    const navigation = useNavigation();

    useEffect(() => {
      const getUsername = async () => {
          const storedUsername = await AsyncStorage.getItem('username');
          if (storedUsername) {
              setUsername(storedUsername);
          }
      };
      getUsername();
  }, []);

    const trackOrder=async()=>{
      try{
      const res = await fetch(`http://127.0.0.1:8080/orderTracker?orderID=${orderID}`);
      const result = await res.json();
      setStatus(result.status);
      }catch(error){
        console.error('Error tracking order', error);
      }
    };
    const updateHue=async()=>{
      try{
        const res = await fetch('http://127.0.0.1:8080/updateDB',{
          method:'POST',
          headers:{
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({hue_id,hue_username,light_id,username}),
        });
        const data = await res.json();
        alert("Database updated successfully", data);

      }catch(error){
        console.error("Failed to update database",data);
    }
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect to hue</Text>
      <TextInput
      placeholder="hue ID"
      value={hue_id}
      onChangeText={sethue_id}
      style={styles.input}
      />
      <TextInput
      placeholder="hue username"
      value={hue_username}
      onChangeText={sethue_username}
      style={styles.input}
      />
      <TextInput
      placeholder="Light ID"
      value={light_id}
      onChangeText={setlight_id}
      style={styles.input}
      />
      <Button title="Connect to hue" onPress={updateHue}/>

      <Text style={styles.title}>OrderId</Text>
      <TextInput
        placeholder="orderID"
        value={orderID}
        onChangeText={setOrderID}
        style={styles.input}
      />
      <Button title="Track order" onPress={trackOrder} />
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

export default Dashboard;