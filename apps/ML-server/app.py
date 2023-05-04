import atexit
import json
import logging
import os
import pickle
import signal
import sys
from typing import Optional

import pandas as pd
import requests
from dotenv import load_dotenv
from mqttSubscriber import MqttSubscriber

client: Optional[MqttSubscriber] = None


"""
Test event:

{
  "sensorId": 1,
  "readTimestamp": "2023-04-22T13:56:07.391Z",
  "sensorValue": {
    "temperature": 30,
    "humidity": 1,
    "lightIntensity": 1,
    "earthMoisture": 1
  }
}
"""


def main():
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
    logging.info("Initializing ML server")

    register_for_kill_signal()

    load_dotenv()
    logging.debug("Reading BACKEND_NOTIFICATION_WEBHOOK: %s",
                  os.environ["BACKEND_NOTIFICATION_WEBHOOK"])

    ml_model = load_ml_model()

    def on_message_callback(message: str):
        logging.debug("Received message: %s", message)
        event = json.loads(message)
        input_df = pd.DataFrame([event["sensorValue"]])

        is_fire_prediction = ml_model.predict(
            input_df[["temperature", "humidity"]])[0]

        if is_fire_prediction:
            logging.debug("Fire detected, propagate notification")
            requests.post(
                os.environ["BACKEND_NOTIFICATION_WEBHOOK"],
                json={
                    "originSensorId": event["sensorId"],
                    "header": "Fire detected",
                    "content": "Probably fire",
                },
            )

    global client
    client = MqttSubscriber(on_message_callback)
    client.start_listening()


def load_ml_model():
    logging.info("Loading ML model")

    logging.debug("Reading MODEL_FILE_PATH: %s", os.environ["MODEL_FILE_PATH"])
    if not os.environ["MODEL_FILE_PATH"]:
        raise Exception("model file must be specified")

    with open(os.environ["MODEL_FILE_PATH"], "rb") as model_file:
        return pickle.load(model_file)


def register_for_kill_signal():
    signal.signal(signal.SIGTERM, on_exit)
    signal.signal(signal.SIGINT, on_exit)


@atexit.register
def on_exit(*args):
    logging.info("Shutting down")

    if not client:
        logging.debug("Client not found, skipping")
        return

    client.disconnect()
    logging.info("Shutdown successfully")


if __name__ == "__main__":
    main()
