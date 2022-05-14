'use strict'
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const ytdl = require('ytdl-core');


const sameMessage = {}
const map = new Map()

class Bot {

    //test sinyal
    /**
     * create random sayHello
     * @param {Array} [array] 
     * @returns {Promise <string>}
     */
    async ping(array) {
        const rdm = Math.floor(Math.random() * array.length)
        return array[rdm]
    };

    async materi(cb){

        const dirPath = 'Mapel'
            if(!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath)
            }

        const filePath = 'Mapel/mapel.json'
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, '[]', 'utf8')
        }
        cb(JSON.parse(fs.readFileSync(`Mapel/mapel.json`)))
    }
    async pr() {

        const dirPath = 'school'
            if(!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath)
            }

        const filePath = 'school/pr.json'
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, '[]', 'utf8')
        }

        return JSON.parse(fs.readFileSync(`school/pr.json`))
    }

    async createPr(){
        
        const pr = await this.pr()
        const daftarPr = pr.length == 0
        const addPr = async m => {
            const body = m.body.split(' ')
            const [, mapel, tugas, hal, deadline, id] = body
            if(!mapel){
                return 'masukan pr dengan urutan [mapel] [tugas] [halaman] [deadline] [id] \n\nmasukan pr tanpa menggunakan simbol []'
            }
            const setPr = {mapel, tugas, hal, deadline, id}
            pr.push(setPr)
            fs.writeFileSync('school/pr.json',JSON.stringify(pr))
            return 'data berhasil ditambahkan'
        }
        const listPr = async () => {
            if(daftarPr){return 'tidak ada pr'}

            let listPr = ''
            pr.forEach((m,i) => listPr += `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline} \nid: ${m.id} ${(pr.length -1) == i ? '' : '\n\n'}` )
            return listPr
        }
        const findMapel = async m => {
            if(daftarPr){return 'tidak ada pr'}

            const mapel = m.body.split(' ')[2]
            const listPr = pr.filter(m => m.mapel == mapel)
            let Pr = ''
            listPr.forEach((m,i) => Pr+= `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline}${(listPr.length -1) == i ? '' : '\n\n'}`)
            return Pr
        }
        const findMapelBYDeadline = async m => {
            if(daftarPr){return 'tidak ada pr'}

            const deadline = m.body.split(' ')[1]
            const listPr = pr.filter(m => m.deadline == deadline)
            let Pr = ''
            listPr.forEach((m,i)=> Pr+= `mapel: ${m.mapel} \ntugas: ${m.tugas} \nhalaman: ${m.hal} \ndeadline: ${m.deadline}${(listPr.length -1) == i ? '' : '\n\n'}`)
            return Pr
        }
        const removePr = async m => {
            if(daftarPr){m.reply('tidak ada pr');return}

            const rm = m.body.slice(6)
            const [prefik, data] = rm.split(' ')

            const rmPr = pr.find(m => m[prefik].toLowerCase() == data.toLowerCase())
            if(!rmPr){m.reply('id tidak ditemuka'); return}
            const addPr = pr.filter(m => m[prefik].toLowerCase() !== data.toLowerCase())
            
            fs.writeFileSync('school/pr.json', JSON.stringify(addPr))
            m.reply('pr berhasil dihapus')
        }
        return {addPr, listPr, findMapel, findMapelBYDeadline, removePr}
    }

    
    async addKuis(getmapel){
        // mengecek file Mapel/mapel.json
        const mapel = await new Promise(resolve => {
            this.materi(materi => {
                // mencocokan getmapel dengan objek mapel yang ada di mapel.json
                const findMapel = materi.find(m => m.mapel.toLowerCase() == getmapel.toLowerCase())
                // jika true maka objek file yang sudah ada bakal di retrun
                if(findMapel){resolve(findMapel); return}

                // jika false maka akan membuat objek baru dengan mapel yang diisi dengan getmapel dan materi yang berisi array kosong
                resolve({mapel: getmapel, materi: []})
            })
        })
        return mapel
        
    }

    /**
     * 
     * @param {"materi"} data 
     * @param {{mapel: "mapel", materi: []}} filename
     */

    async createQuiz(data, filename) {
        // mengekstrak objek yang ada di filename
        const {mapel, materi} = filename
        this.materi(async quiz => {
            // mencocokan data dengan materi dari filename
            const getmateri = materi.find(m => m == data)
            // jika true maka bakal meretrun
            if(getmateri){return}

            // jika false akan menambahkan data ke materi array
            materi.push(data)

            // menghapus file dengan mapel dari filename dengan mapel dari mapel.json
            const getmapel = quiz.filter(m => m.mapel !== mapel)
            // lalu menambahkannya lagi dengan materi yang sudah diperbaharui
            getmapel.push({mapel, materi})
            
            // menulis ulang file mapel.json dengan mapel yang baru jika belum ada dan materi yang sudah diperbaharui jika sudah ada
            fs.writeFileSync('Mapel/mapel.json',  JSON.stringify(getmapel))
        })
        return 
    }
    
    /**
     * @param {"mapel"} mapel 
     * @param {"materi"} materi 
     */

    async createQuizFile(mapel, materi){
        // membuat folder berdasarkan mapel jika belum ada
        const dirPath = `Mapel/${mapel}`
        if(!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath)
        }

        const dirName = `Mapel/${mapel}/${materi}`
        if(!fs.existsSync(dirName)){
            fs.mkdirSync(dirName)
        }

        // membuat file berdasarkan materi jika belum ada
        const filePath = `${dirPath}/${materi}/${materi}.json`
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, '[]','utf-8')
        }
    }

    /**
     * 
     * @param {Mapel} data 
     * @param {MateriMapel} detail 
     * @returns 
     */
    async kuis(data, detail){
        const file = JSON.parse(fs.readFileSync(`Mapel/${data}/${detail}/${detail}.json`))
        let skor = 0
        
        /**
         * @returns {object} mengambil object di dalam array dan mengacak indexnya
         */
        const task = () => {
            const res = Math.floor(Math.random() * file.length)
            const seed = file[res]

            file.splice(res, 1)
            return seed
        }
        return {task, skor, soal: skor}
    }

    /**
     * 
     * @param {SoalKuis} soal 
     * @param {WWebjs} m 
     * @returns {Promise<{user: noTLPUser, task: soalKuis, answer: boolean}>}
     */
    async starKuis( soal, m) {
        const kuis = map.get(m.from)
        let answQuis
        if(m.body.startsWith('!',[0]) || Number(m.body)){
            map.set(m.from, {task: soal()})
            return map.get(m.from)
        }
        else if(kuis.task.jawaban.startsWith(m.body, [0])){
            answQuis = '*BENAR*' 
        }
        else if(!kuis.task.jawaban.startsWith(m.body, [0])){
            answQuis = '*SALAH*'
        }

        map.delete(m.from)
        map.set(m.from, {task: soal(), quiz: answQuis})
        return map.get(m.from)
    }

    

}

module.exports = new Bot()