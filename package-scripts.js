const path = require("path");

const webPath = path.resolve(__dirname, "apps/web");
const ciWebPath = path.resolve(__dirname, "out/apps/web");

module.exports = {
  scripts: {
    prepare: {
      default: `nps prepare.web`,
      web: `yarn`,
      docker: "docker-compose up -d",
      ci: {
        web: `npx turbo prune --scope=web && cd out && yarn install --frozen-lockfile`,
      },
    },
    test: {
      default: `nps test.web`,
      web: `cd ${webPath} && yarn test:watch`,
      ci: {
        default: `nps test.ci.web`,
        web: `cd ${ciWebPath} && yarn test:ci`,
      },
      watch: {
        default: `nps test.watch.web`,
        web: `cd ${webPath} && yarn test:ci`,
      },
    },
    build: {
      default: "npx turbo run build",
      ci: {
        web: "cd out && npm run build",
      },
    },
    docker: {
      build: {
        default: "nps docker.build.web",
        web: `docker build -t web . -f ${webPath}/Dockerfile`,
      },
    },
    dev: "npx turbo run dev",
  },
};
