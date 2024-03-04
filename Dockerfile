#
# EXAMPLE OF MULTISTAGE BUILD FOR MONOREPOS
#
# @link https://github.com/belgattitude/nextjs-monorepo-example
#

###################################################################
# Stage 1: Install all workspaces (dev)dependencies               #
#          and generates node_modules folder(s)                   #
# ----------------------------------------------------------------#
# Notes:                                                          #
#   1. this stage relies on buildkit features                     #
#   2. depend on .dockerignore, you must at least                 #
#      ignore: all **/node_modules folders and .yarn/cache        #
###################################################################

ARG NODE_VERSION=16.14.0
ARG ALPINE_VERSION=3.15

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS deps

#ENV PYTHONUNBUFFERED=1
#RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
#RUN python3 -m ensurepip
#RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk add --no-cache rsync git libc6-compat g++ make python3 py3-pip
RUN yarn global add turbo@1.5.6


WORKDIR /workspace-install

COPY yarn.lock ./
#COPY yarn.lock .yarnrc.yml ./
#COPY .yarn/ ./.yarn/

# Specific to monerepo's as docker COPY command is pretty limited
# we use buidkit to prepare all files that are necessary for install
# and that will be used to invalidate docker cache.
#
# Files are copied with rsync:
#
#   - All package.json present in the host (root, apps/*, packages/*)
#   - All schema.prisma (cause prisma will generate a schema on postinstall)
#
RUN --mount=type=bind,target=/docker-context \
    rsync -amv --delete \
          --exclude='node_modules' \
          --exclude='*/node_modules' \
          --include='package.json' \
          --include='schema.prisma' \
          --include='*/' --exclude='*' \
          /docker-context/ /workspace-install/;

# @see https://www.prisma.io/docs/reference/api-reference/environment-variables-reference#cli-binary-targets
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl

#
# To speed up installations, we override the default yarn cache folder
# and mount it as a buildkit cache mount (builkit will rotate it if needed)
# This strategy allows to exclude the yarn cache in subsequent docker
# layers (size benefit) and reduce packages fetches.
#
# PS:
#  1. Cache mounts can be used in CI (github actions)
#  2. To manually clear the cache
#     > docker builder prune --filter type=exec.cachemount
#
# Does not play well with buildkit on CI
# https://github.com/moby/buildkit/issues/1673

#RUN --mount=type=cache,target=/root/.yarn3-cache,id=yarn3-cache \
#    YARN_CACHE_FOLDER=/root/.yarn3-cache \
#    yarn install --immutable --inline-builds
RUN --mount=type=cache,target=/root/.yarn3-cache,id=yarn3-cache \
    YARN_CACHE_FOLDER=/root/.yarn3-cache \
    yarn install

###################################################################
# Stage 2: Build the app                                          #
###################################################################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder
ENV NODE_ENV=production
ENV NEXTJS_IGNORE_ESLINT=1
ENV NEXTJS_IGNORE_TYPECHECK=0

WORKDIR /app

COPY . .
COPY --from=deps /workspace-install ./

# Optional: if the app depends on global /static shared assets like images, locales...
#RUN yarn workspace web share-static-hardlink && yarn workspace nextjs-app build

# Does not play well with buildkit on CI
# https://github.com/moby/buildkit/issues/1673
#RUN --mount=type=cache,target=/root/.yarn3-cache,id=yarn3-cache \
#    SKIP_POSTINSTALL=1 \
#    YARN_CACHE_FOLDER=/root/.yarn3-cache \
#    yarn workspaces focus web --production

###################################################################
# Stage 3: Extract a minimal image from the build                 #
###################################################################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/next.config.js \
                    /app/apps/web/package.json \
                    ./apps/web/
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE ${NEXTJS_APP_PORT:-3000}

ENV NEXT_TELEMETRY_DISABLED 1

#CMD ["./node_modules/.bin/next", "start", "apps/web/", "-p", "${NEXTJS_APP_PORT:-3000}"]
CMD ["yarn", "web", "-p", "${NEXTJS_APP_PORT:-3000}"]

###################################################################
# Optional: develop locally                                       #
###################################################################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS develop
ENV NODE_ENV=development

WORKDIR /app

COPY --from=deps /workspace-install ./

EXPOSE ${NEXTJS_APP_PORT:-3000}

WORKDIR /app/apps/web

CMD ["yarn", "dev", "-p", "${NEXTJS_APP_PORT:-3000}"]