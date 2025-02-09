FROM denoland/deno:2.1.9

WORKDIR /app

# Prefer not to run as root.
USER deno

COPY . .
RUN deno install
RUN deno cache src/main.ts

ENTRYPOINT ["deno", "run", "start-docker"]