import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
primary: "#1448AA",
success: "#10B981",
background: "#F4F7FA",
card: "#FFFFFF",
text: "#1C1C1E",
muted: "#6A7383",
error: "#EF4444",
};

export default function QuestionDetails() {
const router = useRouter();
const params = useLocalSearchParams();

const questionId = Array.isArray(params?.questionId)
? params.questionId[0]
: params?.questionId;

const topicTitle = params?.topicTitle || "Question";

const [question, setQuestion] = useState(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");
const [debugInfo, setDebugInfo] = useState("");

useEffect(() => {
setDebugInfo(
`Params:\n${JSON.stringify(params, null, 2)}\n\nQuestion ID: ${questionId}`
);
}, []);

const fetchQuestion = async (refresh = false) => {
try {
if (refresh) {
setRefreshing(true);
} else {
setLoading(true);
}

  setError("");

  const url = `https://qna-app.edufocus.co.ke/api/questions/${questionId}`;

  setDebugInfo(
    `Params:\n${JSON.stringify(params, null, 2)}\n\nURL:\n${url}`
  );

  const response = await fetch(url);

  const responseText = await response.text();

  setDebugInfo(
    `Params:\n${JSON.stringify(params, null, 2)}
    

Question ID: ${questionId}

URL:
${url}

Status:
${response.status}

Response:
${responseText}`
);


  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = JSON.parse(responseText);

  setQuestion(data);
} catch (err) {
  setError(err.message || "Failed to load question");
} finally {
  setLoading(false);
  setRefreshing(false);
}


};

useEffect(() => {
if (questionId) {
fetchQuestion();
} else {
setError("Question ID missing");
setLoading(false);
}
}, [questionId]);

if (loading) {
return ( <View style={styles.center}> <ActivityIndicator
       size="large"
       color={COLORS.primary}
     />


    <Text style={{ marginTop: 12 }}>
      Loading Question...
    </Text>
  </View>
);


}

if (error || !question) {
return ( <View style={styles.center}> <Ionicons
       name="alert-circle-outline"
       size={60}
       color={COLORS.error}
     />


    <Text style={styles.errorTitle}>
      Failed to Load
    </Text>

    <Text style={styles.errorText}>
      {error}
    </Text>

    <Text
      style={{
        marginTop: 20,
        color: "red",
        fontSize: 12,
        textAlign: "left",
      }}
    >
      {debugInfo}
    </Text>

    <TouchableOpacity
      style={styles.button}
      onPress={() => fetchQuestion()}
    >
      <Text style={styles.buttonText}>
        Retry
      </Text>
    </TouchableOpacity>
  </View>
);


}

return ( <SafeAreaView style={styles.container}>
<ScrollView
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={() => fetchQuestion(true)}
colors={[COLORS.primary]}
/>
}
contentContainerStyle={{
padding: 20,
paddingBottom: 60,
}}
>
<TouchableOpacity
style={styles.backRow}
onPress={() => router.back()}
> <Ionicons
         name="arrow-back"
         size={20}
         color={COLORS.muted}
       />


      <Text style={styles.backText}>
        {topicTitle}
      </Text>
    </TouchableOpacity>

    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Question
      </Text>

      <HTML
        source={{
          html:
            question?.question_text ||
            "<p>No question available</p>",
        }}
        contentWidth={300}
      />

      {question?.image_url ? (
        <Image
          source={{ uri: question.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : null}
    </View>

    <Text style={styles.answerHeading}>
      Solutions
    </Text>

    {question?.answers?.map((answer) => (
      <View
        key={answer.id}
        style={styles.answerCard}
      >
        <HTML
          source={{
            html: answer.answer_text,
          }}
          contentWidth={300}
        />

        {answer?.image_url ? (
          <Image
            source={{ uri: answer.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : null}
      </View>
    ))}
  </ScrollView>
</SafeAreaView>


);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: COLORS.background,
},
center: {
flex: 1,
justifyContent: "center",
alignItems: "center",
padding: 20,
},
errorTitle: {
marginTop: 12,
fontSize: 22,
fontWeight: "700",
},
errorText: {
textAlign: "center",
marginTop: 10,
color: COLORS.muted,
},
button: {
marginTop: 20,
backgroundColor: COLORS.primary,
paddingHorizontal: 20,
paddingVertical: 12,
borderRadius: 10,
},
buttonText: {
color: "#fff",
fontWeight: "700",
},
backRow: {
flexDirection: "row",
alignItems: "center",
marginBottom: 20,
},
backText: {
marginLeft: 6,
color: COLORS.muted,
},
card: {
backgroundColor: "#fff",
padding: 18,
borderRadius: 16,
marginBottom: 20,
},
sectionTitle: {
fontSize: 20,
fontWeight: "800",
marginBottom: 10,
},
image: {
width: "100%",
height: 240,
marginTop: 14,
},
answerHeading: {
fontSize: 22,
fontWeight: "800",
marginBottom: 14,
},
answerCard: {
backgroundColor: "#fff",
padding: 18,
borderRadius: 16,
marginBottom: 16,
},
});
