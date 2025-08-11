import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";

type Todo = { id: string; title: string; done: boolean };
const STORAGE_KEY = "@todos";

export default function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const didLoad = useRef(false);

  useEffect(() => {
    setStatusBarHidden(true, "slide");
    return () => setStatusBarHidden(false, "none");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTodos(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load todos", e);
      } finally {
        didLoad.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!didLoad.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch((e) =>
      console.warn("Failed to save todos", e)
    );
  }, [todos]);

  const addTodo = () => {
    const title = text.trim();
    if (!title) return;
    setTodos((cur) => [{ id: Date.now().toString(), title, done: false }, ...cur]);
    setText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    Alert.alert("Delete item?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setTodos((cur) => cur.filter((t) => t.id !== id)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.row}>
      <Checkbox value={item.done} onValueChange={() => toggleTodo(item.id)} />
      <Text style={[styles.title, item.done && styles.done]} numberOfLines={2}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden animated />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.header}>My To Do's</Text>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add a new task…"
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTodo}
            returnKeyType="done"
            style={styles.input}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={todos}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: "#fff" },
  header: { fontSize: 28, fontWeight: "700", marginTop: 8, marginBottom: 12, textAlign: "center" },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  addBtn: {
    backgroundColor: "#2e7d32",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addBtnText: { color: "white", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: { flex: 1, fontSize: 16 },
  done: { textDecorationLine: "line-through", color: "#888" },
  delete: { fontSize: 18, paddingHorizontal: 8, color: "#b00020" },
});
