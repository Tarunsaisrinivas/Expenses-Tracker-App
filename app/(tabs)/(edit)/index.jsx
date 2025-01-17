import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../../config/firebase";
import { updateProfile } from "firebase/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const Profile = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const db = getFirestore(); // Firestore instance

  const [photoURL, setPhotoURL] = useState(
    user?.photoURL || "https://www.gravatar.com/avatar?d=mp"
  );

  const handleLogout = () => {
    auth.signOut().then(() => {
      Alert.alert("Success", "Logged out successfully!");
      router.replace("/login");
    });
  };

  const handleImageUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Access to media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setPhotoURL(imageUri);

      // Update Firebase profile
      if (user) {
        await updateProfile(user, { photoURL: imageUri });
        Alert.alert("Success", "Profile picture updated!");
      }
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      const deletedTransactionsRef = collection(db, "deletedTransactions");
      await addDoc(deletedTransactionsRef, {
        description: transaction.description,
        amount: transaction.amount,
        date: new Date().toISOString(), // Save the transaction date
        timestamp: new Date(),
      });
  
      Alert.alert("Transaction Deleted", "The transaction has been deleted.");
    } catch (error) {
      console.error("Error deleting transaction:", error); // Debugging log
      Alert.alert("Error", "Failed to delete transaction.");
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <TouchableOpacity onPress={handleImageUpload}>
        <Image source={{ uri: photoURL }} style={styles.avatar} />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {/* User Details */}
      <Text style={styles.name}>{user?.displayName || "Your Name"}</Text>
      <Text style={styles.email}>{user?.email || "Your Email"}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push("/editprofile")}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.optionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        {/* View Deleted Transactions Button */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push("/deletedTransaction")}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.optionText}>View Deleted Transactions</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4500" />
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    marginBottom: 10,
  },
  changePhotoText: {
    color: "#32CD32",
    marginBottom: 20,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    color: "#888",
    fontSize: 16,
    marginBottom: 30,
  },
  optionsContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  logoutText: {
    color: "#FF4500",
    fontWeight: "bold",
  },
});
