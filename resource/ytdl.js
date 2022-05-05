const ytdl = require('ytdl-core');
const fs = require('fs');

class yt {
    async ytmp4(m) {
        const dl = `http://www.youtube.com/watch?v=QveuPhimQEM`
        const detail = await ytdl.getInfo(dl)
        dl.on('info', (info, format) => console.log(format.contentLength))
            
    }
    async ytmp3(m) {

    }
}

new yt().ytmp4()