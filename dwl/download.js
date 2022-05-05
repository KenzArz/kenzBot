class media {
    async download(m){
        let img;
        img = await m.downloadMedia()
        const qt = await m.getQuotedMessage()
        if (m.hasQuotedMsg) { img = await qt.downloadMedia() }
        return img
    }
}
module.exports.dwl = new media