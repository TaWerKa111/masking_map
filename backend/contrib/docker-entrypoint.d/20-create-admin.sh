#!/bin/sh

set -e

create_admin(){
  python manage.py create_user user -L 'admin' -P '1234' -R 'admin'
}

create_admin

exit 0
