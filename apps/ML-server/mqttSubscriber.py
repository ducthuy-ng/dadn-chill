import os
from typing import Callable, Optional
from urllib.parse import urlparse

from paho.mqtt.client import Client


class MqttSubscriber:
    def __init__(self, on_message_callback: Callable[[str], None]) -> None:
        self.client = Client()
        self._user_on_message_callback = on_message_callback

        def on_connect(client: Client, user_data, mid, granted_qos):
            client.subscribe(os.environ["MQTT_INCOMING_TOPIC"])

        def on_message(client: Client, user_data, message):
            self._user_on_message_callback(message.payload.decode("utf-8"))

        self.client.on_connect = on_connect
        self.client.on_message = on_message

        mqtt_host_name = self._get_host_name_from_mqtt_conn_string(
            os.environ["MQTT_HOSTNAME"]
        )
        if not mqtt_host_name:
            raise Exception("failed to parsed hostname from connection string")

        self.client.connect(mqtt_host_name)
        self.client.loop_forever()

    def disconnect(self):
        self.client.disconnect()

    def _get_host_name_from_mqtt_conn_string(self, url: str) -> Optional[str]:
        parsed_url = urlparse(url)
        return parsed_url.hostname
