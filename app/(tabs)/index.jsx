import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { db, auth } from '../../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const categoryIcons = {
  health: 'heart',
  income: 'cash',
  clothing: 'tshirt-crew',
  dining: 'food',
  food: 'food',
};

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Simulate data fetching
  };
  const [summary, setSummary] = useState({
    totalBalance: 0,
    income: 0,
    expense: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    id: null,
    type: '',
    category: '',
    date: new Date(),
    amount: '',
    description: '',
    receipt: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/transactions`),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTransactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      }));

      newTransactions.sort((a, b) => b.date - a.date);

      setTransactions(newTransactions);

      const newSummary = newTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') {
            acc.income += transaction.amount;
          } else {
            acc.expense += transaction.amount;
          }
          acc.totalBalance = acc.income - acc.expense;
          return acc;
        },
        { totalBalance: 0, income: 0, expense: 0 }
      );

      setSummary(newSummary);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async () => {
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      Alert.alert('Error', 'You must be logged in to add a transaction.');
      return;
    }
  
    if (!newTransaction.type || !newTransaction.category || !newTransaction.amount) {
      console.error('Missing required fields', newTransaction);
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
  
    try {
      const transactionData = {
        type: newTransaction.type,
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date || new Date(),
        description: newTransaction.description || '',
        receipt: newTransaction.receipt || null,
      };
      Alert.alert('Success', 'Transaction added successfully');
      console.log('Transaction data to be added/updated:', transactionData);
  
      if (editingTransaction && newTransaction.id) {
        // Update existing transaction
        const docRef = doc(
          db,
          `users/${auth.currentUser.uid}/transactions`,
          newTransaction.id
        );
        await setDoc(docRef, transactionData, { merge: true });
        console.log('Transaction updated successfully:', transactionData);
      } else {
        // Add new transaction
        const collectionRef = collection(
          db,
          `users/${auth.currentUser.uid}/transactions`
        );
        const docRef = await addDoc(collectionRef, transactionData);
        console.log('New transaction added with ID:', docRef.id);
      }
  
      // Reset modal and state
      resetTransactionForm();
    } catch (error) {
      console.error('Error adding/updating transaction:', error);
      Alert.alert('Error', 'There was an error adding or updating the transaction. Please try again.');
    }
  };
  
  
  const resetTransactionForm = () => {
    setModalVisible(false);
    setNewTransaction({
      id: null,
      type: '',
      category: '',
      date: new Date(),
      amount: '',
      description: '',
      receipt: null,
    });
    setEditingTransaction(false);
  };
  
  const handleEditTransaction = (transaction) => {
    try {
      // Detailed validation of the transaction object
      if (!transaction || typeof transaction !== 'object') {
        throw new Error('Invalid transaction object');
      }
  
      console.log('Editing transaction:', transaction); // Debug log
  
      // Ensure the transaction has an ID from Firestore
      if (!transaction.id) {
        console.error('Transaction missing ID:', transaction);
        throw new Error('Transaction ID is missing');
      }
  
      // Create a properly formatted transaction object
      const formattedTransaction = {
        id: transaction.id, // Keep the original Firestore document ID
        type: transaction.type || '',
        category: transaction.category || '',
        date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
        amount: transaction.amount ? transaction.amount.toString() : '',
        description: transaction.description || '',
        receipt: transaction.receipt || null,
      };
  
      console.log('Formatted transaction:', formattedTransaction); // Debug log
  
      // Update state with formatted data
      setNewTransaction(formattedTransaction);
      setEditingTransaction(true);
      setModalVisible(true);
  
    } catch (error) {
      console.error('Error in handleEditTransaction:', error);
      console.error('Transaction data:', transaction);
      Alert.alert(
        'Error',
        'Cannot edit this transaction. Please try again. ' + error.message
      );
    }
  };
  
  

  const handleDeleteTransaction = async (transaction) => {
    if (!auth.currentUser) return;

    try {
      const transactionRef = doc(db, `users/${auth.currentUser.uid}/transactions`, transaction.id);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        await setDoc(
          doc(db, `users/${auth.currentUser.uid}/deletedTransactions`, transaction.id),
          {
            ...transaction,
            deletedAt: new Date(),
          }
        );

        await deleteDoc(transactionRef);
      } else {
        Alert.alert('Error', 'Transaction not found.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name}>{auth.currentUser?.displayName}</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={24}
            color="white"
          />
        </View>
        <Text style={styles.balanceAmount}>
          $ {summary.totalBalance.toFixed(2)}
        </Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceItem}>
            <MaterialCommunityIcons
              name="arrow-down"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.balanceItemLabel}>Income</Text>
            <Text style={[styles.balanceItemAmount, styles.incomeText]}>
              $ {summary.income.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <MaterialCommunityIcons name="arrow-up" size={20} color="#F44336" />
            <Text style={styles.balanceItemLabel}>Expense</Text>
            <Text style={[styles.balanceItemAmount, styles.expenseText]}>
              $ {summary.expense.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <ScrollView style={styles.transactions}
      
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
      }

      >
      
        {transactions.map((transaction, index) => (
          <View key={transaction.id || `transaction-${index}`} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <MaterialCommunityIcons
                name={
                  categoryIcons[transaction.category.toLowerCase()] || "cash"
                }
                size={24}
                color="white"
              />
              
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionCategory}>
                {transaction.category}
              </Text>
              <Text style={styles.transactionDescription}>
                {transaction.description}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text
                style={[
                  styles.amount,
                  transaction.type === "income"
                    ? styles.incomeText
                    : styles.expenseText,
                ]}
              >
                {transaction.type === "income" ? "+" : "-"} $
                {transaction.amount.toFixed(2)}
              </Text>
              <Text style={styles.date}>
                {transaction.date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.threeDots}
              onPress={() => {
                Alert.alert("Transaction Options", "Choose an action", [
                  {
                    text: "Edit",
                    onPress: () => handleEditTransaction(transaction),
                  },
                  {
                    text: "Delete",
                    onPress: () => handleDeleteTransaction(transaction),
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for Adding or Editing Transaction */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </Text>

            {/* Transaction Type Picker */}
            <View style={styles.inputLabel}>
              <Text style={styles.inputLabelText}>Transaction Type</Text>
              <Picker
                selectedValue={newTransaction.type}
                onValueChange={(itemValue) =>
                  setNewTransaction({ ...newTransaction, type: itemValue })
                }
                style={styles.input}
              >
                <Picker.Item label="Select Transaction Type" value="" />
                <Picker.Item label="Income" value="income" />
                <Picker.Item label="Expense" value="expense" />
              </Picker>
            </View>

            {/* Category Picker */}
            <View style={styles.inputLabel}>
              <Text style={styles.inputLabelText}>Category</Text>
              <Picker
                selectedValue={newTransaction.category}
                onValueChange={(itemValue) =>
                  setNewTransaction({ ...newTransaction, category: itemValue })
                }
                style={styles.input}
              >
                <Picker.Item label="Select Category" value="" />
                <Picker.Item label="Health" value="health" />
                <Picker.Item label="Income" value="income" />
                <Picker.Item label="Clothing" value="clothing" />
                <Picker.Item label="Dining" value="dining" />
                <Picker.Item label="Food" value="food" />
              </Picker>
            </View>

            {/* Amount Input */}
            <View style={styles.inputLabel}>
              <Text style={styles.inputLabelText}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="white"
                keyboardType="numeric"
                value={newTransaction.amount}
                onChangeText={(text) =>
                  setNewTransaction({ ...newTransaction, amount: text })
                }
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputLabel}>
              <Text style={styles.inputLabelText}>Description (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="white"
                value={newTransaction.description}
                onChangeText={(text) =>
                  setNewTransaction({ ...newTransaction, description: text })
                }
              />
            </View>

            {/* Date Picker */}
            <TouchableOpacity style={styles.dateStyle} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputLabelText}>
                Selected Date: {newTransaction.date.toLocaleDateString()}
                <Fontisto name="date" size={18} color="white" />
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={newTransaction.date}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    setNewTransaction({ ...newTransaction, date });
                  }
                  setShowDatePicker(false);
                }}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={styles.savetransaction}
              onPress={handleAddTransaction}
            >
              <Text style={{ color: "white" }}>
                {editingTransaction ? "Update Transaction" : "Save Transaction"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.canceltransaction}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  balanceCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "white",
    fontSize: 18,
  },
  balanceAmount: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginTop: 8,
  },
  balanceDetails: {
    flexDirection: "row",
    marginTop: 8,
  },
  balanceItem: {
    marginRight: 16,
  },
  balanceItemLabel: {
    color: "white",
    fontSize: 14,
  },
  balanceItemAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  incomeText: {
    color: "#4CAF50",
  },
  expenseText: {
    color: "#F44336",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 8,
    color: "white",
  },
  transactions: {
    marginHorizontal: 16,
  },
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "#2C2C2C",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  transactionIcon: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
  },
  transactionDetails: {
    marginLeft: 16,
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  transactionDescription: {
    fontSize: 14,
    color: "gray",
  },
  transactionAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  date: {
    fontSize: 14,
    color: "gray",
  },
  threeDots: {
    marginLeft: 10,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  inputLabel: {
    marginBottom: 16,
  },
  dateStyle: {
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: "white",
    backgroundColor: "#222222",
  },
  savetransaction: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    color: "#fff",
    marginBottom: 20,
  },
  canceltransaction: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    color: "#fff",
    marginBottom: 20,
  },
});

