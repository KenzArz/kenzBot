const ytdl = require('ytdl-core');
const fs = require('fs');

/**
     * 
     * @param {Base64} vid
     * @param {message} m
     * @param {linkkk}
     * @returns {Promise<{media: ytVid, filePath: filePath}>}
     */

async function ytmp3 (vid, m, link) {
    const mp3 = 'https://www.youtube.com/watch?v='+ vid
    const ytInfo = await ytdl.getInfo(mp3)

    const {videoDetails} = ytInfo
    const chat = await m.getChat()
    const img = await link(videoDetails.thumbnails[4].url)
    chat.sendMessage(img, {caption: `data didapatkan, memulai mencovert file. \n\nauthor: ${videoDetails.ownerChannelName}\nTitle/Judul: ${videoDetails.title}`})

    const filePath = `resource/${videoDetails.title}.mp3`
    const media = await new Promise(resolve => {
        ytdl(mp3, {filter: 'audioonly'})
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => resolve(filePath))
    })
    return {media, filePath}
}

module.exports = ytmp3
