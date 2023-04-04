FROM python:3.10.7-buster

# install all OS components
ENV DEBIAN_FRONTEND=noninteractive

# set TIMEZONE
RUN set -eux; \
        rm /etc/localtime; \
        ln -s /usr/share/zoneinfo/Europe/Moscow /etc/localtime; \
        date

# pip install requirements
COPY requirements.txt /transneft/requirements.txt
RUN set -eux; \
        pip install -r /transneft/requirements.txt; \
        rm /transneft/requirements.txt

RUN apt update && apt -y install postgresql-client

COPY ./contrib/docker-entrypoint.sh /docker-entrypoint.sh
ADD ./contrib/docker-entrypoint.d /docker-entrypoint.d/
COPY ./contrib/wait-for-it /wait-for-it/
RUN set -eux; \
        chmod 0700 /docker-entrypoint.sh; \
        chmod 0700 /docker-entrypoint.d/*; \
        chmod 0700 /wait-for-it/*


# copy project
ADD . transneft
WORKDIR transneft/
RUN mkdir "./map_files/"

CMD ["python", "manage.py", "runserver", "--host=0.0.0.0"]

ENTRYPOINT ["/docker-entrypoint.sh"]
