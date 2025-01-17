import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth } from "../../../config/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DeletedTransactions = () => {
  const router = useRouter();
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to view deleted transactions.");
      router.back();
      return;
    }

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/deletedTransactions`),
      orderBy('deletedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deletedAt: doc.data().deletedAt?.toDate(),
        date: doc.data().date?.toDate()
      }));
      setDeletedTransactions(transactions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deleted transactions:", error);
      Alert.alert("Error", "Failed to fetch deleted transactions.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Deleted Transactions</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {deletedTransactions.length > 0 ? (
            deletedTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionDate}>
                    {transaction.deletedAt?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={[
                    styles.amount,
                    transaction.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.category}>{transaction.category}</Text>
                  {transaction.description && (
                    <Text style={styles.description}>{transaction.description}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.noTransactions}>No deleted transactions found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    color: '#888',
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#F44336',
  },
  transactionDetails: {
    marginTop: 4,
  },
  category: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  noTransactions: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default DeletedTransactions;