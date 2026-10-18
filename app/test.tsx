import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Test() {
  return (
    <SafeAreaView>
      <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
        {Array.from(new Array(10)).map((_, index) => (
          <View
            key={index}
            style={{
              height: 100,
              width: 100,
              borderRadius: 10,
              backgroundColor: "lightgray",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{}}>{index}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
