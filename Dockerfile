ARG NODE_VERSION


FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY ./src ./src
COPY ./public ./public
COPY ./package.json \
     ./tsconfig.json \
     ./writeToEnvFile.sh \
     ./.env \
    #  ./.env.loca[l] \
     ./

# write some args to .env file
# RUN chmod 777 ./writeToEnvFile.sh
# RUN --mount=type=secret,id=react_app_crypto_key \
#     ./writeToEnvFile.sh \
        # REACT_APP_CRYPTO_KEY=${REACT_APP_CRYPTO_KEY} \
#         REACT_APP_CRYPTO_IV=${REACT_APP_CRYPTO_IV}

RUN npm i
RUN npm run build

# UNCOMMENT: and comment out above steps and .dockerignore "build" in order to quickly use local build folder 
# COPY ./build ./build


FROM node:${NODE_VERSION}-alpine

WORKDIR /app

ARG HTTPS=
ENV HTTPS=${HTTPS}
ARG PORT=
ENV PORT=${PORT}
ENV SSL_KEY_FILE_PASSWORD= 
ARG SSL_DIR=
ENV SSL_DIR=${SSL_DIR}
ARG SSL_CRT_FILE_NAME=
ENV SSL_CRT_FILE_NAME=${SSL_DIR}/${SSL_CRT_FILE_NAME}
ARG SSL_KEY_FILE_NAME=
ENV SSL_KEY_FILE_NAME=${SSL_DIR}/${SSL_KEY_FILE_NAME}

COPY --from=0 /app/build ./build
COPY --from=0 /app/.env ./
COPY ./${SSL_DIR} ./${SSL_DIR}

RUN npm i -g serve

ENTRYPOINT  if [ $HTTPS = "true" ]; then \
                printf "${SSL_KEY_FILE_PASSWORD}" | serve -s -L -d ./build -l ${PORT} -n --no-port-switching --ssl-cert ${SSL_CRT_FILE_NAME} --ssl-key ${SSL_KEY_FILE_NAME} --ssl-pass /dev/stdin; \
            else \
                serve -s -L -d ./build -l ${PORT} -n --no-port-switching; \
            fi