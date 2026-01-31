{
  "name": "nextjs-custom-auth-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "engines": {
    "node": ">=18.18.0"
  },
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Programming Hero",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "date-fns": "^4.1.0",
    "dotenv": "^16.4.4",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.12.0",
    "multer": "^1.4.5-lts.2",
    "node-cron": "^3.0.3",
    "node-schedule": "^2.1.1",
    "nodemailer": "^6.9.16",
    "pdf-parse": "^1.1.1",
    "pdfkit": "^0.17.1",
    "puppeteer": "^24.16.1",
    "sanitize-html": "^2.17.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "nodemon": "^3.0.3"
  }
}
