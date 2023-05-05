#!/bin/sh

set -e

create_expert(){
  python manage.py create_user user -L 'expert' -P '1234' -R 'expert'
}

create_expert

exit 0
