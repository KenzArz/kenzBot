const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const clientId = 'Kenz01'
const Id = new LocalAuth({clientId})
const worker = `${Id.dataPath}/session-${clientId}/Default/Service Worker`
if(fs.existsSync(worker)){fs.rmdirSync(worker, {recursive: true})}

const client = new Client({authStrategy: Id, puppeteer: { headless: false, args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
    ]}});

client.on('authenticated', () => {console.log('AUTHENTICATED')});
client.on('ready', () => console.log('connected... \nand this a massage from the user: '));

module.exports.client = client