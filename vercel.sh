#!/bin/bash
 
if [[ $VERCEL_ENV == "production"  ]] ; then 
  pnpm run build:prod
else 
  pnpm run build
fi
