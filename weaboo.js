'use strict';
const fs = require('fs');
const fetch = require('node-fetch')
const base64 = require('ba64');

class anime {

    /** 
     * @param {Base64} sausAnime
     * @returns {Promise<json>}
    */
    async getSausAnime(sausAnime) {
        base64.writeImageSync('anime/sample', `data:image/jpeg;base64,${sausAnime}`)
        const img = await fetch("https://api.trace.moe/search?anilistInfo", {
            method: "POST",
            body: fs.readFileSync('anime/sample.jpeg'),
            headers: { 'Content-Type': 'image/jpeg' }
        });
        return img.json()
    }


    /**
     * 
     * @param {Base64} [anime]
     * @returns {Promise <{image: AnimeImgae, result: AnimeDetail, adult: KontenDewasa }>}
     */
    async searchNime(anime) {
        const response = await this.getSausAnime(anime)
        let find = 0
        response.result.forEach(i => {if (find < i.similarity) find = i.similarity});
        const file = response.result.find(i => find == i.similarity)
        const { image, episode, anilist: { title: { native, romaji, english }, isAdult } } = file
        return {image, result: `╾─͙─͙─͙Info Anime─͙─͙─͙╼͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
➤ judul jepang : ${native}
➤ romaji/latin  : ${romaji}
➤ judul inggris : ${english}
➤ episode ke : ${episode}


⠀⟣⊷⊶⊷⊶᪥✿᪥⊷⊶⊷⊶⟢`, adult: isAdult ?'hasil yang ditemukan kemungkinan berupa HANIME. master saya melarang mengirim data file HANIME, maka dari itu pengiriman data dibatalkan' : undefined}
    }

    /**
     * 
     * @param {Base64} animeAll 
     * @returns {Promise <{search: AnimeDetail, adult: KontenDewasa}>}
     */
    async searchNimeAll(animeAll) {
        const response = await this.getSausAnime(animeAll)
        let search = ''
        let doujin = ''
        let adult;
        let nmb = 0
        const result = response.result
        const saveNsfw = result.filter(m => m.anilist.isAdult == false)
        const nsfw = result.filter(m => m.anilist.isAdult == true)
        saveNsfw.forEach((m , i) => {
            const { image, episode, anilist: { title: { native, romaji, english }} } = m
            search += `╾─͙─͙─͙Info Anime─͙─͙─͙╼

➤ judul jepang : ${native}
➤ romaji/latin  : ${romaji}
➤ judul inggris : ${english}
➤ episode ke : ${episode}
➤ detail gambar : ${image}

⠀⟣⊷⊶⊷⊶᪥✿᪥⊷⊶⊷⊶⟢ ${(saveNsfw.length - 1) == i ? '' : '\n\n\n'}`
})
    nsfw.forEach((m,i) => {
        const { image, episode, anilist: { title: { native, romaji, english }}} = m

        adult = `terdapat ${++nmb} data yang kemungkinan berupa HANIME. dikarenakan master saya melarang data HANIME, maka sebagian data pengiriman tidak akan dikirim!`
        doujin += `╾─͙─͙─͙Info Anime─͙─͙─͙╼

➤ judul jepang : ${native}
➤ romaji/latin  : ${romaji}
➤ judul inggris : ${english}
➤ episode ke : ${episode}
➤ detail gambar : ${image}
        
⠀⟣⊷⊶⊷⊶᪥✿᪥⊷⊶⊷⊶⟢ ${(result.length - 1) == i ? '' : '\n\n\n'}`
    })
            
        return { search, adult, hanime: doujin}
    }
}

module.exports.wibu = new anime