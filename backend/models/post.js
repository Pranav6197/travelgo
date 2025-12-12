import { Schema, model } from 'mongoose';

const postSchema = new Schema({
    authorName: String,
    title: String,
    imageLink: String, // Deprecated, use images instead
    images: [String], // Array of image URLs
    categories: [String],
    description: String,
    isFeaturedPost: Boolean,
    timeOfPost: { type: Date, default: Date.now },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export default model('Post', postSchema);
