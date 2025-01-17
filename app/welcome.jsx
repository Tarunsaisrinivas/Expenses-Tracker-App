import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated } from "react-native";

import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const handlelogin = () => {
    router.replace("/login");
  };
  useEffect(() => {
    
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 2000, 
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  return (
    <View style={styles.container}>
   
      <View style={styles.topRightContainer}>
        <TouchableOpacity onPress={handlelogin}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <Animated.Image
        style={[styles.image, { opacity: imageOpacity }]}
        source={require("../assets/welcome.png")} 
        resizeMode="contain"
      />

      <View style={styles.bottomSection}>
        <Text style={styles.bottomText}>Always take control of your finances</Text>
        <Text style={styles.subbottomText}>
          Finances Must be arranged to set a better lifestyle in future
        </Text>
        <TouchableOpacity style={styles.button} onPress={handlelogin}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  topRightContainer: {
    position: "absolute",
    top:5,
    right: 10,
  },
  signInText: {
    fontSize: 19,
    padding: 5,
    fontWeight: "500",
    color: "white",
  },
  image: {
    width: "100%",
    height:"50%", 
    alignSelf: "center",
    marginTop: 10,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 70, 
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: -5, 
    },
    shadowRadius: 10, 
    shadowOpacity: 0.5,
    elevation: 10, 
    zIndex: 1, 
  },
  bottomText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  subbottomText: {
    fontSize: 18,
    marginTop: 28,
    color: "#808080",
    textAlign: "center",
  },
  button: {
    width: "90%",
    backgroundColor: "#a3e635",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
});
