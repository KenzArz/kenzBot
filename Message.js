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
            const data = m.body.slice(3)
            const [mapel, tugas, hal, deadline, id] = data.split(' -- ')
            if(!mapel){
                return 'masukan pr dengan urutan [mapel] [tugas] [halaman] [deadline] [id] \n\nmasukan pr tanpa menggunakan simbol []'
            }
            if(!id){
                return 'silahkan masuka data pr secara detail dengan urutan [mapel] [tugas] [halaman] [deadline] [id]'
            }
            const setPr = {mapel, tugas, hal, deadline, id, status: "not completed"}
            pr.push(setPr)
            fs.writeFileSync('school/pr.json',JSON.stringify(pr))
            return 'data berhasil ditambahkan'
        }
        const listPr = async m => {
            if(daftarPr){return 'tidak ada pr'}

            const data = m.body.slice(8) 
            const [prefik, mapel] =  data.split(' -- ')
            if(prefik && !mapel){return 'harap masukan sertakan mapel setelah detail \n\n*contoh*: \nlist pr -- id -- _[id dari pr]_'}
            const listPr = pr.filter(m =>  m[prefik] == mapel)
            if(listPr.length == 0){return `pr dari ${prefik} ${mapel} tidak ditemukan`}
            let Pr = ''

            listPr.forEach((m,i) => Pr += `*???${m.mapel}???*
            
????????????????????????????????????????????????

??? *TUGAS: ${m.tugas}*
??? *HALAMAN: ${m.hal}*
??? *DEADLINE: ${m.deadline}*
??? *ID: ${m.id}*
??? *STATUS: ${m.status}*

???????????????????????????????????????????????? ${(listPr.length -1) == i ? '' : '\n\n\n'}`)
            return Pr
        }
        const removePr = async m => {
            if(daftarPr)return'tidak ada pr'

            const rm = m.body.slice(6)
            const [prefik, data] = rm.split(' -- ')
            if(!prefik)return 'masukan id atau yang lainya untuk menghapus pr'
            else if(!data)return 'masukan nama mapel yang ingin dihapus'

            const rmPr = pr.find(m => m[prefik].toLowerCase() == data.toLowerCase())
            if(!rmPr)return 'mapel atau id tidak ditemukan'
            const addPr = pr.filter(m => m[prefik].toLowerCase() !== data.toLowerCase())
            
            fs.writeFileSync('school/pr.json', JSON.stringify(addPr))
            return 'pr berhasil dihapus'
        }
        const editPr = async m => {
            if(daftarPr)return 'tidak ada pr'

            const body = m.body.slice(8)
            const [mapelId , data, prefik, status] =  body.split(' -- ')
            
            if(!mapelId)return 'tambahkan kata \'id\' atau yang lainya untuk mencari pr yang ingin diedit pr'
            else if(!data)return 'masukan nama id atau yang lainnya yang ingin diedit'
            else if(!prefik)return 'tambahkan kata \'id\' atau yang lainya untuk mengedit pr berdasarkan id atau yang lainnya'
            else if(!status)return 'masukan data yang ingin anda ubah'

            const file = pr.find(m => m[mapelId] == data)
            if(!file){return 'pr tidak ditemukan'}
            const findStatus = pr.filter(m => m[mapelId] !== data)
            file[prefik] = status
            findStatus.push(file)
            fs.writeFileSync('school/pr.json', JSON.stringify(findStatus))
            return 'pr berhasil diedit'

        }
        return {addPr, listPr, removePr, editPr}
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
        return {task, skor, soal: skor, msg: []}
    }

    /**
     * 
     * @param {SoalKuis} soal 
     * @param {WWebjs} m 
     * @returns {Promise<{task: soalKuis, quiz: boolean, jawaban: jawabanSoal}>}
     */
    async starKuis( soal, m) {
        const kuis = map.get(m.from)
        let answQuis
        if(m.body.startsWith('!kuis')){
            map.set(m.from, {task: soal()})
            return map.get(m.from)
        }
        const jawaban = kuis.task.jawaban.toLowerCase()
        jawaban.startsWith(m.body.toLowerCase(), [0]) ? answQuis = '*BENAR*' : answQuis = '*SALAH*'
        
        map.delete(m.from)
        map.set(m.from, {task: soal(), quiz: answQuis, jawaban})
        return map.get(m.from)
    }

    

}

module.exports = new Bot()