# World Cup Bet (Front and Backend)

## Environment variables

On Next.js it is posible to define environment variables on a file. 

In order to be recognized by Nextjs:
. The file used for development must be called `.env.development`.
. The file used for production must be called: `.env.production`.

The file `.env.example` is a sample of the content used in this project for environment variables. The filename `.env.example` is not recognized by Nextjs, it is just a sample.


Now, to use environmet variables, you must run in your terminal:
`npm run build`
`npm run start`
This will make use of the file `.env.production`.

And to use development environment varaibles you must run:
`npm run dev`
This will make use the file `.env.development`.

## Local Dev

After cloning the repo to install every package run on your terminal:
```
npm install
```

To run front and backend on localhost run on your terminal:
```
npm run dev
```

## Deployment

To deploy to Gcloud:

1. Create a project on Gcloud.
2. Enable App Engine (Use Nodejs and Standard type. Select default time zone).
3. Download Gcloud from SDK https://cloud.google.com/sdk/docs/install
4. Initiate with `glcoud init` and follow the process.
5. on /App folder run `npm run build`
6. Deploy with `gcloud app deploy --project idOfTheProject`.




