export const getAudioData = (url) => {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  return fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .catch(error => {
      console.error(error);
  });
};


export function polarPath(amplitude, frequency, phase, numPoints) {
    const waveform = [];
    const deltaTheta = (2 * Math.PI) / numPoints;
  
    for (let i = 0; i < numPoints; i++) {
      const theta = i * deltaTheta;
      const r = amplitude * Math.sin(frequency * theta + phase);
      waveform.push({ r, theta });
    }
  
    return waveform;
  }