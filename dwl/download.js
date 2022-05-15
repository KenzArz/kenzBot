class media {
    async download(m){
        const qt = await m.getQuotedMessage()
        const img = await m.downloadMedia() || await qt.downloadMedia()
        
        return img
    }
}
module.exports.dwl = new media()