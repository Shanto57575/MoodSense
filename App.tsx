//App.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Types
interface MoodEntry {
  id: string;
  scale: number;
  description: string;
  timestamp: string;
  insight?: string;
}

export default function App() {
  const [moodScale, setMoodScale] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Load mood history on app start
  useEffect(() => {
    loadMoodHistory();
  }, []);

  // Load mood history from AsyncStorage
  const loadMoodHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('moodHistory');
      if (history) {
        setMoodHistory(JSON.parse(history));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load mood history');
    }
  };

  // Save mood entry to AsyncStorage
  const saveMoodEntry = async (entry: MoodEntry) => {
    try {
      const updatedHistory = [entry, ...moodHistory];
      await AsyncStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
      setMoodHistory(updatedHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry');
    }
  };

   const handleSubmit = async () => {
  if (description.trim().length === 0) {
    Alert.alert('Error', 'Please enter a mood description');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('http://192.168.0.198:3000/api/mood-insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scale: moodScale,
        description: description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI insight');
    }

    const data = await response.json();
    const insight = data.insight;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      scale: moodScale,
      description: description,
      timestamp: new Date().toISOString(),
      insight: insight,
    };

    await saveMoodEntry(newEntry);
    setCurrentInsight(insight);
    setDescription('');
  } catch (error) {
    console.error("error", error);
    Alert.alert('Error', 'Failed to get AI insight. Please try again.');
  } finally {
    setLoading(false);
  }
};

const renderMoodChart = () => {
  if (moodHistory.length < 2) return null;

  const data = {
    labels: moodHistory.slice(0, 7).reverse().map(() => ''),
    datasets: [{
      data: moodHistory.slice(0, 7).reverse().map(entry => entry.scale)
    }]
  };

  return (
    <LineChart
      data={data}
      width={Dimensions.get('window').width - 40}
      height={220}
      chartConfig={{
        backgroundColor: '#1E293B',
        backgroundGradientFrom: '#1E293B',
        backgroundGradientTo: '#1E293B',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
        labelColor: () => '#E2E8F0',
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '5',
          strokeWidth: '2',
          stroke: '#5196F4'
        },
        propsForBackgroundLines: {
          strokeDasharray: '', // Solid lines
          stroke: '#334155',
          strokeWidth: 1,
        },
        strokeWidth: 2,
      }}
      bezier
      style={styles.chart}
    />
  );
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mood Tracker</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>How are you feeling? (1-5)</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={moodScale}
          onValueChange={setMoodScale}
          minimumTrackTintColor="#5196F4"
          maximumTrackTintColor="#d3d3d3"
        />
        <Text style={styles.scaleValue}>{moodScale}</Text>

        <Text style={styles.label}>Describe your mood:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="How are you feeling today?"
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Get AI Insight</Text>
          )}
        </TouchableOpacity>
      </View>

      {currentInsight ? (
        <View style={styles.insightContainer}>
          <Text style={styles.insightTitle}>AI Insight:</Text>
          <Text style={styles.insightText}>{currentInsight}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.historyButtonText}>
          {showHistory ? 'Hide History' : 'Show History'}
        </Text>
      </TouchableOpacity>

      {showHistory && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Mood History</Text>
          {renderMoodChart()}
          {moodHistory.map((entry) => (
            <View key={entry.id} style={styles.historyEntry}>
              <Text style={styles.historyDate}>
                {new Date(entry.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.historyMood}>
                Mood: {entry.scale}/5
              </Text>
              <Text style={styles.historyDescription}>
                {entry.description}
              </Text>
              {entry.insight && (
                <Text style={styles.historyInsight}>
                  Insight: {entry.insight}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 48,
    marginBottom: 32,
    textAlign: 'center',
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 17,
    marginBottom: 12,
    color: '#F1F5F9',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  slider: {
    height: 50, // Increased height for better touch area
    marginBottom: 16,
    marginHorizontal: -8, // Gives more space for the slider
  },
  scaleValue: {
    textAlign: 'center',
    fontSize: 32,
    marginBottom: 28,
    color: '#5196F4',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#F1F5F9',
    backgroundColor: '#1E293B',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#5196F4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5196F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  insightContainer: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  historyButton: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  historyContainer: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  historyEntry: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  historyMood: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#5196F4',
  },
  historyDescription: {
    fontSize: 16,
    marginBottom: 12,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  historyInsight: {
    fontSize: 15,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  chart: {
    marginVertical: 24,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1E293B',
  },
});