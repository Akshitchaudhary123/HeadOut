const multer = require('multer')

try {
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public')
    
        },
        filename: (req, file, cb) => {
    
            cb(null, `${Date.now()}-${file.originalname}`)
        }
    });
    
} catch (error) {
    console.log(`error in multer ${error}`);
}

const upload = multer({ storage: storage,limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = upload;