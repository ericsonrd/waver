import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { getAudioData, polarPath } from "./waveform-path.js";
import { Svg, Path } from 'react-native-svg';

const App = () => {
  const [audioSvg, setAudioSvg] = useState();
  const audioSound = require('./assets/hello_world.ogg');

  // Play a sound //
  const playSound = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(audioSound);
      await soundObject.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
    AudioPath(audioSound);
  };

  const AudioPath = async(file) => {
      try {
        const audioData = await getAudioData(file);
        const pathLogo = polarPath(audioData,{
          samples: 100,
          type: 'steps',
          left: 200,
          top: 200,
          distance: 100,
          length: 100,
          animation: true
        });
        setAudioSvg({ d: pathLogo });
      } catch (error) {
        console.log('Error retrieving audio data:', error);
      }
      AudioPath(audioSound);
  };
  // Render UI //
  return (
    <View style={styles.main}>
      <View style={styles.topView}>
        <Svg width="100%" height="100%">
          <Path fill="white" stroke="black" {...audioSvg} />
        </Svg>
      </View>
      <View style={styles.bottomView}>
        <TouchableOpacity onPress={playSound}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Play</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  main: {
    flex: 1, 
    padding: 18, 
    paddingTop: 32
  },
    topView: {
      flex: 2, 
      width: '100%'
    },
      waveform: {
        flexDirection: 'row',
        overflow: 'hidden',
      },
        waveformPoint: {
          width: 2,
          backgroundColor: 'blue', // Adjust the color as per your preference
        },
    bottomView: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
      buttonContainer: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: 150, 
        height: 50, 
        backgroundColor: 'orange', 
        borderRadius: 14
      },
        buttonText: {
          fontSize: 18, 
          fontWeight: 600, 
          color: 'white'
        }

})
export default App;