import { devConfig } from './credentials'

export const config = {
  dev: {
    // udagrambowendev
    // udagrambowendev.cmjf4ifnxtrz.us-east-1.rds.amazonaws.com
    username: devConfig.POSTGRES_USERNAME,
    password: devConfig.POSTGRES_PASSWORD,
    database:  devConfig.POSTGRES_DATABASE,
    host: devConfig.POSTGRES_HOST,
    dialect: 'postgres',
    aws_region:  devConfig.AWS_REGION,
    aws_profile:  devConfig.AWS_PROFILE,
    aws_media_bucket:  devConfig.AWS_BUCKET
  },
  prod: {
    username: '',
    password: '',
    database: 'udagram_prod',
    host: '',
    dialect: 'postgres',
  },
};
