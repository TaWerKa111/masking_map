FROM python:3.10.7-buster

# pip install requirements
COPY requirements.txt /consumer/requirements.txt
RUN set -eux; \
        pip install -r /consumer/requirements.txt; \
        rm /consumer/requirements.txt

RUN apt update && apt -y install postgresql-client

# copy project
ADD . consumer
WORKDIR consumer/

CMD ["python", "manage.py", "launch", "consumer"]
