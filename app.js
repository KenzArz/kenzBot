const chalk = require('chalk');
const { bot} = require('./Message.js');
const {client}  = require('./qr.js');
const { MessageMedia} = require('whatsapp-web.js');
const { wibu } = require('./weaboo.js')
const {dwl} = require('./dwl/download');
const mp3 = require('./resource/ytdl')
const map = new Map()
const dl = require('ytdl-core')
const fs = require('fs');
const sameMessage = {}
const owner = 'fitur ini hanya bisa digunakan oleh owner'

client.on('message', async m => {



    // //MENGIRIM JADWAL
    // if (m.body.startsWith('!jadwal', 0)) {
    //     const chat = await m.getChat()
    //     const jadw = await Admin.jadwalSklh(m)
    //     chat.sendMessage(jadw)
    //     return
    // };

    // TEST SINYAL
    if (m.body == '!ping') {
        const contact = await m.getContact()
        const chat = await m.getChat()
        const msg = await bot.ping(["halo", "kenapa", "hadir", "ada yang bisa dibantu"])
        await chat.sendMessage(`${msg} @${contact.id.user}`, {
            mentions: [contact]
        });
        return
    };

    //SEARCH ANIME
    if (m.body.startsWith('!search')) {

        //DOWNLOAD DATA/IMAGE
        const chat = await m.getChat()   
        const img = await dwl.download(m)

        //SEARCH ALL DATA
        if(m.body == '!searchall'){
            const srcImg = await wibu.searchNimeAll(img.data)
            const {search, adult, hanime} = srcImg
            if(adult){m.reply(adult); m.reply(hanime, '6283891059445@c.us')}
            chat.sendMessage(search); return
        }

        // SEARCH ONE DATA
        const srcImg = await wibu.searchNime(img.data)
        const media = await MessageMedia.fromUrl(srcImg.image)
        if(srcImg.adult){ m.reply(srcImg.adult); m.reply(media, '6283891059445@c.us',{caption: srcImg.result});return}
        chat.sendMessage(media, {caption: srcImg.result})
        return
    }

    //DOWNLOAD VIDEO YOUTUBE MENJADI MP3
    if(m.body.startsWith('!ytmp3')){
        const url = m.body.slice(24)
        const yt = await mp3(url, m, MessageMedia.fromUrl)
        const {  filePath, media  } = yt
        const chat = await m.getChat()
        chat.sendMessage( MessageMedia.fromFilePath(media), {sendMediaAsDocument: true})
        fs.rmSync(filePath, {recursive: true})
        return
    }
    

    if(m.body == '!sticker'){m.reply(await dwl.download(m), null, {sendMediaAsSticker: true, stickerAuthor: 'Kenz'}); return}


    //SET KUIS
    if(m.body.startsWith('!kuis')){
        const get = m.body.split(' ')
        const [, body, detail, plus] = get
        if(!body){
            let getBody = ''
            await bot.materi(m => {
                const mapel = m.map(n => n.mapel)
                mapel.forEach(i => getBody += `${i} \n`)
            })
            m.reply(`berikut daftar mapel yang tersedia untuk kuis \n\n${getBody} \n*contoh penggunaan*:\n_!kuis *mapel*_\n!kuis matWajib`)
            return}

        if(!detail) {
            let getDetail = ''
            await bot.materi(m => {
                const mapel = m.find(n => n.mapel.toLowerCase() == body.toLowerCase() ? n.materi : '')
                mapel.materi.forEach(i => getDetail += `${i} \n`)
            })
            m.reply(`berikut daftar materi yang tersedia untuk kuis ${body}: \n\n${getDetail} \n*contoh penggunaan*:\n_!kuis *mapel materi*_\n!kuis matWajib fungsi linear`); return}

        map.set(m.from, {kuis: await bot.kuis( body, `${detail} ${plus? plus : ''}`)})

    }

    if(map.has(m.from)){

        const chat = await m.getChat()
        const get = map.get(m.from)
        const startKuis = await bot.starKuis(get.kuis.task, m)

        if(m.body == '!exit'){chat.sendMessage('kuis telah diberhentikan. Terimakasih sudah mengerjakan kuis'); map.set(m.from, {setKuis: false}); return}
        startKuis.quiz == '*BENAR*' ? m.reply(`${startKuis.quiz} \nskor : ${++get.kuis.skor}`) : ''
        startKuis.quiz == '*SALAH*' ? m.reply(`${startKuis.quiz} \nskor : ${get.kuis.skor}`) : ''

        if(startKuis.task === undefined){chat.sendMessage('kuis telah selesai. Terimakasih sudah mengerjakan kuis'); map.delete(m.from); return}
        chat.sendMessage(`*SOAL ${++get.kuis.soal}* \n\n${startKuis.task.soal} `)
        return
    }

})
client.initialize().catch(e => console.log(chalk ` {red ${e}}`));