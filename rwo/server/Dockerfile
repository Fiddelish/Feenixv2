FROM rwo_server_build:dev as build

FROM rwo_python:dev as prod

WORKDIR /opt/rwo
COPY --from=build /opt/rwo/venv /opt/rwo/venv/
COPY abi /opt/rwo/abi
COPY create_db.py /opt/rwo/
COPY entrypoint.sh /opt/rwo/
RUN chmod ugo+x /opt/rwo/entrypoint.sh
ENV ABI_PATH /opt/rwo/abi
ENV VIRTUAL_ENV /opt/rwo/venv
ENV PATH /opt/rwo/venv/bin:$PATH

EXPOSE 5000
EXPOSE 5001

ENTRYPOINT ["./entrypoint.sh"]
