FROM registry.mdindia.com/custom_images/nginx-react-base:3.0

LABEL maintainer="rdurgam@mdindia.com"
LABEL app="frontend-react"

WORKDIR /usr/share/nginx/html/

# Clean default (optional, base already cleaned)
RUN rm -rf /usr/share/nginx/html/*

# Copy React build
COPY dist/ .

# Entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
