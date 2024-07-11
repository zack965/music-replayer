const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const getWatchValue = (url) => {
    const urlParams = new URL(url).searchParams;
    return urlParams.get('v');
}

const videoUrl = 'https://www.youtube.com/watch?v=0iC10hKsi20&list=RD0iC10hKsi20&start_radio=1'; // Replace with the YouTube URL
const outputFileName = 'out' + getWatchValue(videoUrl) + 'put.mp3';
const durationInHours = 1;
const durationInSeconds = durationInHours * 3600;

const downloadAndProcessAudio = async (url) => {
    try {
        console.log('Downloading audio...');
        const audioStream = ytdl(url, { quality: 'highestaudio' });

        const tempFileName = 'temp_audio.mp3';
        const writeStream = fs.createWriteStream(tempFileName);

        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log('Download finished.');
            console.log('Processing audio...');

            ffmpeg(tempFileName)
                .setStartTime(0)
                .setDuration(durationInSeconds)
                .inputOptions(['-stream_loop -1']) // Loop the input audio indefinitely
                .outputOptions(['-t ' + durationInSeconds]) // Set the output duration
                .output(outputFileName)
                .on('end', () => {
                    console.log('Processing finished.');
                    fs.unlinkSync(tempFileName); // Remove the temporary file
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    fs.unlinkSync(tempFileName); // Remove the temporary file in case of error
                })
                .run();
        });

    } catch (err) {
        console.error('Error:', err);
    }
};

downloadAndProcessAudio(videoUrl);
