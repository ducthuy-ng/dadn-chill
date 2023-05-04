FROM python:3.10.11-slim-buster

# Install poetry
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VERSION=1.4.1
RUN python3 -m venv $POETRY_HOME &&\
  $POETRY_HOME/bin/pip install -U pip setuptools && \
  $POETRY_HOME/bin/pip install poetry==${POETRY_VERSION}

ENV PATH="${PATH}:${POETRY_HOME}/bin"

WORKDIR /app

# Install dependencies
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-interaction --no-cache --without dev,ml

ENV MQTT_HOSTNAME=mqtt://localhost:1883
ENV MQTT_INCOMING_TOPIC=chill-topic
ENV BACKEND_NOTIFICATION_WEBHOOK=http://localhost:3000/notification-webhook/
ENV MODEL_FILE_PATH=/app/decision_tree.model

COPY apps/ML-server/*.py ML/decision_tree.model /app/
CMD [ "poetry", "run", "python", "/app/app.py"]
