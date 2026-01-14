import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function HomeScreen() {
  const [balance, setBalance] = useState(0);

  const USER_ID = 1; // temp (later from login)

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await API.get(`/wallet/${USER_ID}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.log("Balance error", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AeroPay</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balance}>₹ {balance}</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.action}>Pay</Text>
        <Text style={styles.action}>Scan</Text>
        <Text style={styles.action}>History</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30
  },
  balanceCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30
  },
  balanceLabel: {
    fontSize: 14,
    color: "#777"
  },
  balance: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  action: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    width: "30%",
    textAlign: "center",
    fontWeight: "600"
  }
});
