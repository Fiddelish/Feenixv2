# Install dependencies only when needed
FROM alpine:3 as npms
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat git nodejs~=18 npm
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --no-cache gcc g++ make

WORKDIR /work


# Install dependencies based on the preferred package manager
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM alpine:3 as runner
RUN apk add --no-cache libc6-compat git nodejs~=18 npm
WORKDIR /work
COPY --from=npms /work/package.json ./package.json
COPY --from=npms /work/package-lock.json ./package-lock.json
COPY --from=npms /work/node_modules ./node_modules

COPY simple ./simple
COPY build.config.ts ./

RUN npx hardhat --config build.config.ts compile
RUN npx hardhat --config build.config.ts clean
COPY hardhat.config.ts ./

EXPOSE 8545
