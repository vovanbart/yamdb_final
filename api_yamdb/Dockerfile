FROM python:3.9-alpine

RUN apk update && apk add --no-cache \
    postgresql-dev \
    build-base \
    libc-dev \
    linux-headers

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt --no-cache-dir

COPY . .

# Чистим ненужное
RUN apk del build-base libc-dev linux-headers

EXPOSE 8000
