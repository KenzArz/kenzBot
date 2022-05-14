const chalk = require('chalk');
const { bot} = require('./Message.js');
const {client}  = require('./qr.js');
const { wibu } = require('./weaboo.js')
const {dwl} = require('./dwl/download');
const mp3 = require('./resource/ytdl')
const map = new Map()
const { MessageMedia, Buttons, List} = require('whatsapp-web.js');
const dl = require('ytdl-core')
const fs = require('fs');
const base64 = require('ba64');


let kuis;

client.on('message', async m => {
    
    if(m.from == '6289530016712@c.us' || '62838914059445'){
        const pr = await bot.createPr()
        const {addPr, listPr, findMapel, findMapelBYDeadline, removePr} = pr
        
            if(m.body == 'pr help'){
                m.reply(`daftar menu untuk pr \n\n[!pr] [mapel] [tugas] [halaman] [deadline] [id] \nuntuk menambahkan pr baru \n\n[!list pr] \nuntuk menampilkan seluruh pr yang masih ada \n\n[!cari pr] \nmencari pr berdasarkan mapel \n\n[!deadline] \nmencari pr berdasarkan deadline \n\n [!rm pr] [prefik mapel/id] [mapel/id] \nmenghapus berdasarkan mapel/id \n\n\nmasukan command tanpa menggunakan simbol []\n\n*NOTE*: jangan menambahkan spasi pada [mapel]/[tugas]/[id] karna akan mengacaukan cara kerja bot.\ncontoh penggunaan: *_pr matwajib fungsi_linear 19 rabu tugas_matminat01_* \n\njika menghapus pr bedasarkan mapelnya, perlu diingat bahwa menghapus berdasarkan mapel akan menghapus seluruh pr yang mempunyai mapel yang sama`);
                return
            }
            else if(m.body.startsWith('pr')){
                addPr(m).then(i => m.reply(i))
                return
            }
            else if(m.body == 'list pr') {
                listPr(m).then(i => m.reply(i))
                return
            }
            else if(m.body.startsWith('cari pr ')){
                findMapel(m).then(i => m.reply(i))
                return
            }
            else if(m.body.startsWith('deadline')){
                findMapelBYDeadline(m).then(i => m.reply(i))
                return
            }
            else if(m.body.startsWith('rm pr')){
                removePr(m).then(i => m.reply(i))
                return
            }


        // MENAMBAHKAN KUIS BARU
        if(m.body.startsWith('add kuis')){
            if(m.body == 'add kuis help'){
                m.reply('cara menambahkan kuis: \n\n[mapel]\ndi isi dengan nama mapel \n\n[materi]\nmateri dari mapel \n\n[nsoal]\nsoal yang ingin ditambahkan\n\n[jawaban]\njawaban dari kuis \n\n*_cara penggunaan_*: \nadd kuis matwajib - fungsi linear - 1 + 1 = \na. 10\nb.11\nc.2\nd.1\ne.semua jawaban benar - c <--(itu jawaban)')
            }
            //menghapus "add kuis"
            const kuis = m.body.slice(9)
            // mengubah string menjadi array
            const body = kuis.split(' - ')
            const qt = await m.getQuotedMessage()
            let image;
            if(m.hasMedia || m.hasQuotedMsg){
                image = await dwl.download(qt || m)
            }
            const [getmapel, getmateri, getsoal, getjawaban] = body

            // membuat objek baru
            const addKuis = await bot.addKuis(getmapel)

            // membuat file mapel.json dengan materi dari getmateri dan objek dari addKuis
            await bot.createQuiz(getmateri, addKuis)

            // membuat folder baru dari getmapel di folder Mapel dan file baru dari getmateri
            await bot.createQuizFile(getmapel, getmateri)

            const dirPath = `Mapel/${getmapel}/${getmateri}`
            
            
            const filePath = `${dirPath}/${getmateri}.json`

            //membaca file dari getmapel/getmateri yang sudah dibuat 
            const file = JSON.parse(fs.readFileSync(filePath))            
            
            if(image){
                const folder = `${dirPath}/image`
                if(!fs.existsSync(folder)){fs.mkdirSync(folder)}
                base64.writeImageSync(`${folder}/${getsoal}`, `data:image/jpeg;base64,${image.data}`)
            }

            // lalu menambahkan soal dari getsoal dan jawaban dari getjawaban

            file.push({soal: image ? undefined : getsoal, jawaban: getjawaban, image: image ? `${dirPath}/image/${getsoal}.jpeg` : undefined})

            // dan menulis kembali isi file dari getmapel/getmateri yang sudah dibuat
            fs.writeFileSync(filePath, JSON.stringify(file))
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
        chat.sendMessage( MessageMedia.fromFilePath(filePath), {sendMediaAsDocument: true})
        fs.rmSync(media, {recursive: true})
        return
    }

    if(m.body == '!sticker'){m.reply(await dwl.download(m), null, {sendMediaAsSticker: true, stickerAuthor: 'Kenz'}); return}

    //SET KUIS
    if(m.body.startsWith('!kuis')){
        const get = m.body.split(' ')
        const [, body, detail] = get
        if(!body){
            let getBody = ''
            await bot.materi
            (m => {
                const mapel = m.map(n => n.mapel)
                mapel.forEach(i => getBody += `${i} \n`)
            })
            m.reply(`berikut daftar mapel yang tersedia untuk kuis \n\n${getBody} \n*contoh penggunaan*:\n!kuis matWajib`)
            return}

        if(!detail) {
            let getDetail = ''
            await bot.materi(m => {
                const mapel = m.find(n => n.mapel.toLowerCase() == body.toLowerCase() ? n.materi : '')
                mapel.materi.forEach(i => getDetail += `${i} \n`)
            })
            m.reply(`berikut daftar materi yang tersedia untuk kuis ${body}: \n\n${getDetail} \n*contoh penggunaan*:\n!kuis matWajib fungsi linear`); return
        }
        map.set(m.from, await bot.kuis( body, detail)) 

    }
    
    if(map.has(m.from)){

        const chat = await m.getChat()
        const get = map.get(m.from)
        const startKuis = await bot.starKuis(get.task, m)

        if(m.body == '!exit'){chat.sendMessage('kuis telah diberhentikan. Terimakasih sudah mengerjakan kuis'); map.delete(m.from);return}
        startKuis.quiz == '*BENAR*' ? m.reply(`${startKuis.quiz} \nskor : ${++get.skor}`) : ''
        startKuis.quiz == '*SALAH*' ? m.reply(`${startKuis.quiz} \nskor : ${get.skor}`) : ''

        if(startKuis.task === undefined){chat.sendMessage('kuis telah selesai. Terimakasih sudah mengerjakan kuis'); map.delete(m.from); return}

        if(startKuis.task.image){
            const media = MessageMedia.fromFilePath(startKuis.task.image)
            chat.sendMessage(media)
        }
        const sections = [{title: 'judul', rows: [{title: 'a'}, {title: 'b'},{title: 'c'},{title: 'd'},{title: 'e'}]}]
        const list = new List(`${startKuis.task.soal  || 'soal berupa image'} `, 'jawaban', sections, `*SOAL ${++get.soal}*`, 'KenzBot')
        chat.sendMessage(list)
        return
    }

})
client.initialize().catch(e => console.log(chalk ` {red ${e}}`));