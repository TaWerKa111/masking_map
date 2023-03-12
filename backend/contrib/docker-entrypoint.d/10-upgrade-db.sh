#!/bin/sh

set -e

upgrade_db(){
  /wait-for-it/wait-for-it.sh $POSTGRES_HOST:$POSTGRES_PORT -t 30 -- echo "database is ready"
  cd /transneft/common/
  alembic upgrade head
}

upgrade_db

exit 0
