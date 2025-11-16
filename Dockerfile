ARG NODE_VERSION=latest


FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

ARG APP_ENV=production

COPY ./src ./src
COPY ./public ./public
COPY ./package.json \
     ./tsconfig.json \
     ./.env \
     ./.env.loca[l] \
     ./

ENV NODE_ENV=APP_ENV
RUN npm i
RUN npm run build

# UNCOMMENT FOR DEV USE: and comment out above steps and .dockerignore "build" in order to quickly use local build folder 
# COPY ./build ./build


# NOTE: mount nginx.conf using compose
FROM nginx:alpine

WORKDIR /app

# Copy to nginx dir
WORKDIR /usr/share/nginx/html
# remove default nginx static assets
RUN rm -rf ./*
COPY --from=build /app/build .

# run in foreground
ENTRYPOINT ["nginx", "-g", "daemon off;"]