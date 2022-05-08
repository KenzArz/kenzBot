const ytdl = require('ytdl-core');
const fs = require('fs');


async function ytmp3 (vid, m, link) {
    const mp3 = 'https://www.youtube.com/watch?v='+ vid
    const ytInfo = await ytdl.getInfo(mp3)

    const {videoDetails} = ytInfo
    const img = await link(videoDetails.thumbnails[4].url)
    m.reply(img, {caption: `data didapatkan, memulai mencovert file. \n\nauthor: ${videoDetails.ownerChannelName}\nTitle/Judul: ${videoDetails.title}`})

    const filePath = `resource/${videoDetails.title}.mp3`
    const media = await new Promise(resolve => {
        ytdl(mp3, {filter: "audioonly"})
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => resolve(filePath))
    })
    
    return {media, filePath}
}

module.exports = ytmp3
