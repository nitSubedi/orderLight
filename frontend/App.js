import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Homescreen from './app/Homescreen';
import Register from './app/Register';
import Login from './app/Login';
import Dashboard from "./app/Dashboard";

const Stack = createNativeStackNavigator();
const App = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Homescreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name = "Dashboard" component={Dashboard}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
  
  export default App;