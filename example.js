const fs = require('fs');
const { Request } = require('node-fetch');
const fetch = require('node-fetch')

async function con() {

    const data = fs.readFileSync('anime/weboo.txt', 'utf8')
    let bf = data.replace('/^data:image\/jpg;base64,/', '')
    bf += bf.replace('+', '')
    const bin = Buffer.from(bf, 'base64').toString('binary')
    fs.writeFileSync('example.jpg', bin, 'binary')

    const img = await fetch("https://api.trace.moe/search?anilistInfo", {
        method: "POST",
        body: fs.readFileSync('example.jpg'),
        headers: { 'Content-Type': 'image/jpeg' }
    })
    const nim = await img.json()
    console.log(nim.result[0].anilist)

    // const js = anm.result

    // let find = []

    // const similiar = js.forEach(i => {
    //     if (find < i) {
    //         find = i.similarity
    //     }
    // });

    // const same = js.find(i => {
    //     return find == i.similarity
    // })

    // const { image, episode, anilist: { title, isAdult } } = same

    // console.log(title)


}

con()