import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import multer from 'multer';

const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: HTTP_STATUS.BAD_REQUEST,
            message:
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'Each image must be 4 MB or smaller.'
                    : 'A post can contain at most 3 uploaded images.',
            errors: [],
        });
    }
    res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message || RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        errors: err.errors || [],
    });
};

export default errorMiddleware;
