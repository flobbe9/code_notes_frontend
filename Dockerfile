ARG NODE_VERSION


FROM node:${NODE_VERSION}-alpine as build

WORKDIR /app

COPY ./src ./src
COPY ./public ./public
COPY ./package.json \
     ./tsconfig.json \
     ./.env \
    #  ./.env.loca[l] \
     ./

RUN npm i
RUN npm run build

# UNCOMMENT FOR DEV USE: and comment out above steps and .dockerignore "build" in order to quickly use local build folder 
# COPY ./build ./build


# FROM node:${NODE_VERSION}-alpine
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