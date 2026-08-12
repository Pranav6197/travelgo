import multer from 'multer';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        // Real-ESRGAN expands an image to 4x its width and height. Keeping the
        // browser upload small prevents one post from exhausting the worker.
        fileSize: 4 * 1024 * 1024,
        files: 3,
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new Error('Only JPEG, PNG, and WebP images are supported.'));
        }
        callback(null, true);
    },
});

export const postImageUpload = upload.array('images');
