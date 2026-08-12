/**
 * @typedef {Object} Post
 * @property {string} _id
 * @property {string} authorName
 * @property {string} title
 * @property {string} imageLink
 * @property {string[]} [images]
 * @property {{originalUrl: string, processedUrl?: string, imageStatus: 'READY'|'PROCESSING'|'FAILED', enhancementRequested: boolean}[]} [imageAssets]
 * @property {string} timeOfPost
 * @property {string} description
 * @property {string[]} categories
 * @property {string} [authorId]
 */
export default {};
