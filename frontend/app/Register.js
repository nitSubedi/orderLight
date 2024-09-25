import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const[doorDashEmail,setDoorDashEmail]=useState('');
    const[doorDashPassword,setDoorDashPassword]=useState('');
    const [hueBridgeIP, sethueBridgeIP] = useState('');
    const[hueUserName,setHueUserName]=useState('');
    const navigation = useNavigation(); 

    const handleSignup = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            
            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Account created successfully');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', data.message || 'An error occurred');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="DoorDash Email"
                value={doorDashEmail}
                onChangeText={setDoorDashEmail}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder=" DoorDash Password"
                value={doorDashPassword}
                onChangeText={setDoorDashPassword}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="Hue Bridge IP"
                value={hueBridgeIP}
                onChangeText={sethueBridgeIP}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="Hue Username"
                value={hueUserName}
                onChangeText={setHueUserName}
                style={styles.input}
                secureTextEntry
            />
            <Button title="Sign Up" onPress={handleSignup} />
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

export default Register;
