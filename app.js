const chalk = require('chalk');
const { bot} = require('./Message.js');
const {client}  = require('./qr.js');
const { MessageMedia, Buttons, List} = require('whatsapp-web.js');
const { wibu } = require('./weaboo.js')
const {dwl} = require('./dwl/download');
const mp3 = require('./resource/ytdl')
const map = new Map()
const dl = require('ytdl-core')
const fs = require('fs');
const { MessagePort } = require('worker_threads');

let kuis;

client.on('message', async m => {
    
    if(m.from == '6289530016712@c.us' || '62838914059445'){
        bot.pr(pr => {
            const daftarPr = pr.length == 0

            if(m.body == 'pr help'){
                m.reply(`daftar list untuk pr \n\n[!pr] [mapel] [tugas] [halaman] [deadline] [id] \nuntuk menambahkan pr baru \n\n[!list pr] \nuntuk menampilkan seluruh pr yang masih ada \n\n[!cari pr] \nmencari pr berdasarkan mapel \n\n[!deadline] \nmencari pr berdasarkan deadline \n\n [!rm pr] [prefik mapel/id] [mapel/id] \nmenghapus berdasarkan mapel/id \n\n\nmasukan command tanpa menggunakan simbol []\n\n*NOTE*: jangan menambahkan spasi pada [mapel]/[tugas]/[id] karna akan mengacaukan cara kerja bot.\ncontoh penggunaan: *_pr matwajib fungsi_linear 19 rabu tugas_matminat01_* \n\njika menghapus pr bedasarkan mapelnya, perlu diingat bahwa menghapus berdasarkan mapel akan menghapus seluruh pr yang mempunyai mapel yang sama`);
                return
            }
            else if(m.body.startsWith('pr')){

                const body = m.body.split(' ')
                const [, mapel, tugas, hal, deadline, id] = body
                if(!mapel){
                    m.reply('masukan pr dengan urutan [mapel] [tugas] [halaman] [deadline] [id] \n\nmasukan pr tanpa menggunakan simbol []')
                    return
                }
                const setPr = {mapel, tugas, hal, deadline, id}
                pr.push(setPr)
                fs.writeFileSync('school/pr.json',JSON.stringify(pr))
                m.reply('data berhasil ditambahkan')
                return
            }
            else if(m.body == 'list pr') {
                if(daftarPr){m.reply('tidak ada pr');return}

                let listPr = ''
                pr.forEach((m,i) => listPr += `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline} \nid: ${m.id} ${(pr.length -1) == i ? '' : '\n\n'}` )
                m.reply(listPr)
            }
            else if(m.body.startsWith('cari pr ')){
                if(daftarPr){m.reply('tidak ada pr');return}

                const mapel = m.body.split(' ')[2]
                const listPr = pr.filter(m => m.mapel == mapel)
                let Pr = ''
                listPr.forEach((m,i) => Pr+= `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline}${(listPr.length -1) == i ? '' : '\n\n'}`)
                m.reply(Pr)
            }
            else if(m.body.startsWith('deadline')){
                if(daftarPr){m.reply('tidak ada pr');return}

                const deadline = m.body.split(' ')[1]
                const listPr = pr.filter(m => m.deadline == deadline)
                let Pr = ''
                listPr.forEach((m,i)=> Pr+= `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline}${(listPr.length -1) == i ? '' : '\n\n'}`)
                m.reply(Pr)
            }
            else if(m.body.startsWith('rm pr')){
                if(daftarPr){m.reply('tidak ada pr');return}

                const rm = m.body.slice(6)
                const [prefik, data] = rm.split(' ')

                const rmPr = pr.find(m => m[prefik].toLowerCase() == data.toLowerCase())
                if(!rmPr){m.reply('id tidak ditemuka'); return}
                const addPr = pr.filter(m => m[prefik].toLowerCase() !== data.toLowerCase())
                
                fs.writeFileSync('school/pr.json', JSON.stringify(addPr))
                m.reply('pr berhasil dihapus')
            }
        })


        // MENAMBAHKAN KUIS BARU
        if(m.body.startsWith('add kuis')){
            const kuis = m.body.slice(9)
            const body = kuis.split(' - ')
            const quiz = body.filter(m => m !== 'mapel' && m !== 'materi' && m !== 'soal' && m !== 'jawaban' )
            const [getmapel, getmateri, getsoal, getjawaban] = quiz
            const addKuis = await bot.addKuis(getmapel)
            await bot.createQuiz(getmateri, addKuis)
            await bot.createQuizFile(getmapel, getmateri)
            
            const file = JSON.parse(fs.readFileSync(`Mapel/${getmapel}/${getmateri}.json`))

            file.push({soal: getsoal, jawaban: getjawaban})
            fs.writeFileSync(`Mapel/${getmapel}/${getmateri}.json`, JSON.stringify(file))
            return
        }
    }

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
    //INVIT BOT
    if(m.body.startsWith('!join')){
        const invit = m.body.slice(31)
        try{
            await client.acceptInvite(invit)
            m.reply('joined the group')
        }
        catch(e){
            console.log(e)
        }
    }

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
            await bot.materi
            (m => {
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
        const chat = await m.getChat()
        !chat.isGroup ? map.set(m.from, {kuis: await bot.kuis( body, `${detail} ${plus? plus : ''}`)}) : ''

    }

    if(map.has(m.from)){

        const chat = await m.getChat()
        const get = map.get(m.from)
        const startKuis = await bot.starKuis(get.kuis.task, m)

        if(m.body == '!exit'){chat.sendMessage('kuis telah diberhentikan. Terimakasih sudah mengerjakan kuis'); map.set(m.from, {setKuis: false}); return}
        startKuis.quiz == '*BENAR*' ? m.reply(`${startKuis.quiz} \nskor : ${++get.kuis.skor}`) : ''
        startKuis.quiz == '*SALAH*' ? m.reply(`${startKuis.quiz} \nskor : ${get.kuis.skor}`) : ''

        if(startKuis.task === undefined){chat.sendMessage('kuis telah selesai. Terimakasih sudah mengerjakan kuis'); map.delete(m.from); return}
        // chat.sendMessage(`*SOAL ${++get.kuis.soal}* \n\n${startKuis.task.soal} `);
        const sections = [{title: 'judul', rows: [{title: 'a'}, {title: 'b'},{title: 'c'},{title: 'd'},{title: 'e'}]}]
        const list = new List(`${startKuis.task.soal} `, 'jawaban', sections, `*SOAL ${++get.kuis.soal}*`, 'KenzBot')
        client.sendMessage(m.from, list)
        return
    }

})
client.initialize().catch(e => console.log(chalk ` {red ${e}}`));