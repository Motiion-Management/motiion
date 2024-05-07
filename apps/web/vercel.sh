#!/bin/bash
 
if [[ $VERCEL_ENV == "production"  ]] ; then 
  turbo run build-prod
else 
  turbo run build-prod
fi
