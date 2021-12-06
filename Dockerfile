FROM "litespeedtech/openlitespeed:1.7.11-lsphp73"

LABEL NAME "pulapirata"

COPY ./prototipo /var/www/vhosts/localhost/html
