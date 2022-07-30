FROM nginx:1.22.2
RUN rm -f /etc/nginx/conf.d/*
COPY containers/nginx/nginx.conf /etc/nginx/conf.d/app.conf
CMD /usr/sbin/nginx -g 'daemon off;' -c /etc/nginx/nginx.conf
