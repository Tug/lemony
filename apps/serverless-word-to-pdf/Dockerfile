FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.4-node16-x86_64

RUN npm install -g yarn

COPY package.json ${LAMBDA_TASK_ROOT}/
COPY ./src ${LAMBDA_TASK_ROOT}/

RUN yarn install

CMD [ "src/convert.handler" ]
