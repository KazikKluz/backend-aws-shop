import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({
  path: path.join(__dirname, '../.env'), // Ensure this path is correct
});

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../cert.pem')),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions, cors: true });

  await app.listen(process.env.PORT ?? 3000);

  console.log('Application is running on: https://localhost:3000');
}
bootstrap();
