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

export const polarPath = (audioBuffer, options) => {
    const { 
        channel = 0,
        samples = audioBuffer.length,
        distance = 50,
        length = 100,
        top = 0,
        left = 0,
        type = 'steps',
        startdeg = 0,
        enddeg = 360,
        invertdeg = false,
        invertpath = false,
        paths = [{d:'Q', sdeg: 0, sr:0, deg: 50, r: 100, edeg:100, er:0}],
        animation = false,
        animationframes = 10,
        normalize = true,
        } = options;
    
    const framesData = getFramesData(audioBuffer, channel, animation, animationframes);
    const filteredData = getFilterData(framesData, samples);
    const normalizeData = (normalize ? getNormalizeData(filteredData) : filteredData);

    let path = "";
    const fixenddeg = (enddeg < startdeg ? enddeg+360 : enddeg);
    const deg = (!invertdeg ? (fixenddeg-startdeg) / samples : (startdeg-fixenddeg) / samples );
    const fixOrientation = (!invertdeg ? 90+startdeg : 90+startdeg+180 );
    const invert = (!invertpath ? 1 : -1);
    const pathslength = paths.length;
    const fixpathslength =  (type == 'mirror' ? pathslength*2 : pathslength);
    const pi180 = Math.PI / 180;

    const normalizeDataLength = normalizeData.length;

    for(let f = 0; f < normalizeDataLength; f++) {
        if(f>0) {
            const pathlength = path.length;
            const lastvalue = path.charAt(pathlength - 1);
            if(lastvalue == ";" || pathlength === 0) {
                path+=' M 0 0 ;';
            } else {
                path += ';';
            }
        }       

        let last_pos_x = -9999;
        let last_pos_y = -9999;
        
        for (let i = 0; i < samples; i++) {
            const positive =  (type != 'bars' ? (i % 2 ? 1: -1) : 1);
            let mirror = 1;
            for(let j = 0; j < fixpathslength; j++) {
                let k = j;
                if(j >= pathslength) {
                    k = j - pathslength;
                    mirror = -1;   
                }
                paths[k].minshow = paths[k].minshow ?? 0;
                paths[k].maxshow = paths[k].maxshow ?? 1;
                paths[k].normalize = paths[k].normalize ?? false;
                const normalizeDataValue = (paths[k].normalize ? 1 : normalizeData[f][i]);
                if(paths[k].minshow <= normalizeData[f][i] && paths[k].maxshow >= normalizeData[f][i]) {
                    const angleStart =  ((deg*(i+paths[k].sdeg/100)) - fixOrientation) * pi180;
                    const angle =  ((deg*(i+paths[k].deg/100)) - fixOrientation) * pi180;
                    const angleEnd =  ((deg*(i+paths[k].edeg/100)) - fixOrientation) * pi180;

                    const pos_x = left + ((length*(paths[k].sr/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.cos(angleStart);
                    const pos_y = top + ((length*(paths[k].sr/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.sin(angleStart);
                    
                    const center_pos_x = left + ((length*(paths[k].r/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.cos(angle);
                    const center_pos_y = top + ((length*(paths[k].r/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.sin(angle);

                    const end_pos_x = left + ((length*(paths[k].er/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.cos(angleEnd);
                    const end_pos_y = top + ((length*(paths[k].er/100)*normalizeDataValue)* positive*mirror*invert + distance) * Math.sin(angleEnd);

                    if(pos_x !== last_pos_x || pos_y !== last_pos_y) {   
                        path += `M ${pos_x} ${pos_y} `;
                    }

                    path += `Q ${center_pos_x} ${center_pos_y} ${end_pos_x} ${end_pos_y} `; 
                    
                    last_pos_x = end_pos_x;
                    last_pos_y = end_pos_y;                             
                }
            }       
        }
    }
    return path;
}

const getFramesData = (audioBuffer, channel, animation, animationframes) => {
    const rawData = audioBuffer.getChannelData(channel);
    
    const framesData = [];
    if(animation) {
        const frames = audioBuffer.sampleRate / animationframes;
        for (let index = 0; index < rawData.length; index += frames) {
            const partraw = rawData.slice(index, index+frames);
            framesData.push(partraw);
        }
    } else {
        framesData.push(rawData);
    }

    return framesData;
}

const getFilterData = (framesData, samples) => {
    const filteredData = [];
    const framesDataLength = framesData.length;
    for(let f = 0; f < framesDataLength; f++) {
        const blockSize = Math.floor(framesData[f].length / samples); // the number of samples in each subdivision
        const filteredDataBlock = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i; // the location of the first sample in the block
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(framesData[f][blockStart + j]); // find the sum of all the samples in the block
            }
            filteredDataBlock.push(sum / blockSize); // divide the sum by the block size to get the average
        }
        filteredData.push(filteredDataBlock);
    }
    return filteredData;   
}

const getNormalizeData = (filteredData) => {
    const multipliers = [];
    const filteredDataLength = filteredData.length
    for(let i = 0; i < filteredDataLength; i++) {
        const multiplier = Math.max(...filteredData[i]);
        multipliers.push(multiplier);
    }
    const maxMultiplier = Math.pow(Math.max(...multipliers), -1);

    const normalizeData = [];
    for(let i = 0; i < filteredDataLength; i++) {
        const normalizeDataBlock = filteredData[i].map(n => n * maxMultiplier);
        normalizeData.push(normalizeDataBlock);
    }
    return normalizeData;
}