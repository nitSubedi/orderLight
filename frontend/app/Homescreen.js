import React from "react";
import { Text, View, Button, StyleSheet} from "react-native";

const HomeScreen = ({navigation})=>{
    return(
        <View style = {styles.container}>
            <Text style = {styles.title}>FoodLight</Text>
            <Button title="Login" onPress={()=> navigation.navigate('Login')}/>
            <Button title="Sign Up" onPress={()=> navigation.navigate('Register')}/>
            <Button title="Connect to hue" onPress={()=>navigation.navigate('ConnectToHUe')}/>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: "center",
        alignItems: "center"
    },
    title:{
        fontSize: 24,
        marginBottom: 52
    }

})
export default HomeScreen;

