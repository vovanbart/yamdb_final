# api_yamdb/Dockerfile

FROM python:3.9-alpine

# Установим системные пакеты для сборки psycopg2
RUN apk update && apk add --no-cache \
    postgresql-dev \
    build-base \
    libc-dev \
    linux-headers

WORKDIR /app

# Скопировать только манифест и установить зависимости
COPY requirements.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt --no-cache-dir

# Скопировать весь код
COPY . .


# Запустить gunicorn
CMD ["gunicorn", "api_yamdb.wsgi:application", "--bind", "0.0.0.0:8000"]