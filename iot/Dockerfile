# VERSION 0.1
# DOCKER-VERSION  1.7.0
# AUTHOR:         Antonio Lain <antlai@cafjs.com>
# DESCRIPTION:    Template for a CAF Raspberry Pi 2 app (armv7)
# TO_BUILD:       docker build --rm -t localhost.localdomain:5000/<appName>:<etag> .
# TO_RUN:         docker run -p <app_port>:3000 -v /<appName>/config:/config localhost.localdomain:5000/<appName>:<etag>
#

FROM gcr.io/cafjs-k8/root-rpi2armhf

ENTRYPOINT ["node"]

CMD [ "./index.js" ]
