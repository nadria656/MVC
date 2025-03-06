const StorageModel = require('../models/storage.js');
const {uploadToPinata} = require('../utils/handleUploadIPFS.js');

const uploadImage = async (req, res) => {
    try {
        // Verificar si el archivo fue enviado
        console.log('req.file:', req.file);
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const fileBuffer = req.file.buffer;
        const filename = req.file.originalname;
        
        console.log('Uploading file:', filename);
        
        // Subir a Pinata
        const pinataResponse = await uploadToPinata(fileBuffer, filename).catch(err => {
            console.error('Error uploading to Pinata:', err);
            throw new Error('Pinata upload failed');
        });

        // Verificar la respuesta de Pinata
        const ipfsFile = pinataResponse.IpfsHash;
        if (!ipfsFile) {
            console.error('Error: No IPFS hash returned from Pinata');
            return res.status(500).send('Pinata upload did not return IPFS hash');
        }

        // Crear URL IPFS
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        console.log('IPFS URL:', ipfs);

        // Guardar en la base de datos
        const data = await StorageModel.create({filename, url: ipfs});
        console.log('Data saved to DB:', data);

        res.json(data);
    } catch (err) {
        console.error('Error during upload process:', err);
        res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE");
    }
};

module.exports = {uploadImage};
