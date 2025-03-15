FROM nginx:1.27.0

COPY ./ /usr/share/nginx/html


# docker build -t wiki24 .
# docker run -p 80:80 -v "$(pwd):/usr/share/nginx/html" wiki24