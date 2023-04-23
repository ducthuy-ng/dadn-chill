import atexit
import json
import os
import pickle
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
    load_dotenv()
    ml_model = load_ml_model()

    def on_message_callback(message: str):
        event = json.loads(message)
        input_df = pd.DataFrame([event["sensorValue"]])

        is_fire_prediction = ml_model.predict(input_df[["temperature", "humidity"]])[0]

        if is_fire_prediction:
            requests.post(
                os.environ["BACKEND_NOTIFICATION_WEBHOOK"],
                json={
                    "originSensorId": event["sensorId"],
                    "header": "Fire detected",
                    "content": "Probably fire",
                },
            )

    client = MqttSubscriber(on_message_callback)


def load_ml_model():
    with open("ML/decision_tree.model", "rb") as model_file:
        return pickle.load(model_file)


@atexit.register
def on_exit():
    print("shutting down")
    if not client:
        return

    client.disconnect()


if __name__ == "__main__":
    main()
