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
    async pr(cb) {

        const dirPath = 'school'
            if(!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath)
            }

        const filePath = 'school/pr.json'
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, '[]', 'utf8')
        }

        cb(JSON.parse(fs.readFileSync(`school/pr.json`)))
    }


    async addKuis(getmapel){
        const mapel = await new Promise(resolve => {
            this.materi(materi => {
                const findMapel = materi.find(m => m.mapel.toLowerCase() == getmapel.toLowerCase())
                if(findMapel){resolve(findMapel); return}
                resolve({mapel: getmapel, materi: []})
            })
        })
        return mapel
        
    }
    async createQuiz(data, filename) {
        const {mapel, materi} = filename
        this.materi(async quiz => {
            const getmateri = materi.find(m => m == data)
            if(getmateri){return}
            materi.push(data)
            const getmapel = quiz.filter(m => m.mapel !== mapel)
            
            getmapel.push({mapel, materi})
            
            fs.writeFileSync('Mapel/mapel.json',  JSON.stringify(getmapel))
        })
        return 
    }

    async createQuizFile(mapel, materi){
        const dirPath = `Mapel/${mapel}`
        if(!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath)
        }
        const filePath = `${dirPath}/${materi}.json`
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, '[]','utf-8')
        }
    }

    async addQuiz(){

    }

    /**
     * 
     * @param {Mapel} data 
     * @param {MateriMapel} detail 
     * @returns 
     */
    async kuis(data, detail){
        const file = JSON.parse(fs.readFileSync(`Mapel/${data}/${detail}.json`))
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

module.exports = {
    bot: new Bot()
}