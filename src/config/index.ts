export default () => ({
  environment: process.env.NODE_ENV || `development`,
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
    refreshTokenSecret: process.env.REFRESH_JWT_SECRET,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    public_key: process.env.STRIPE_PUBLIC_KEY,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});
