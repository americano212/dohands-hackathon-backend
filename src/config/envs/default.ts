export const config = {
  db: {
    type: process.env['DB_TYPE'],
    entities: ['dist/**/*.entity.{ts,js}'],
  },
  bcrypt: {
    salt: Number(process.env['BCRYPT_SALT']) || 10,
  },
  api: {
    port: process.env['PORT'],
  },
  jwt: {
    accessTokenExpire: process.env['ACCESS_TOKEN_EXPIRE'] || '1d',
    refreshTokenExpire: process.env['REFRESH_TOKEN_EXPIRE'] || '30d',
  },
  aws: {
    accessKey: process.env['AWS_ACCESS_KEY_ID'] || '',
    secretKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
    region: process.env['AWS_REGION'],
    s3: {
      bucketName: process.env['AWS_S3_BUCKET_NAME'] || '',
    },
  },
  slack: {
    webhookUrl: process.env['SLACK_WEBHOOK_URL'] || '',
  },
  googleSheet: {
    client_email: process.env['GOOGLE_CLIENT_EMAIL'] || '',
    private_key: process.env['GOOGLE_PRIVATE_KEY'] || '',
    spread_sheet_id: process.env['GOOGLE_SPREAD_SHEET_ID'],
  },
};
