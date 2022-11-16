#!/usr/bin/env bash

set -o nounset -o errexit -o xtrace

# Deploy to Goerli
if [ $1 = 'goerli' ]
then
    wcbConfig="deploy/contentProdGoerli"
    wcbProject="worldcup-goerli"

#Deploy to Mainnet
elif [ $1 = 'mainnet' ]
then
    wcbConfig="deploy/contentProdMainnet"
    wcbProject="worldcup-367919"
else 
echo "Invalid network"
exit 1
fi


# Copy config content to env variables file
cp -f "$wcbConfig" .env.production

# Build the app
npm run build 

# Deploy to Gcloud
gcloud app deploy --project "$wcbProject" --quiet
    
spd-say done
