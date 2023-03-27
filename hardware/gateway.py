# python 3.6
import json
import random
import time
import datetime
import os
import logging
import serial
import serial.tools.list_ports as list_ports
import sys
import signal
import glob
from dotenv import load_dotenv
from paho.mqtt import client as mqtt_client


def signal_handler(signal, frame):
    print('You pressed Ctrl+C!')
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
load_dotenv()


class UndecodedBuffer(Exception):
    def __init__(self, buffer: str):
        self.buffer = buffer

    def __str__(self):
        return f"Error: Received Undecoded buffer at {self.buffer}"


class SensorBuilder:
    def __init__(self, timestamp=datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), location=[10.41115, 106.95474]):
        self.__id = -1
        self.__timestamp = timestamp
        self.__location = location
        self.__temperature = 0
        self.__humidity = 0
        self.__earth_moisture = 0
        self.__light_intensity = 0
        self.__LED = 0
        self.__water_pump = 0

    def id(self, id: int):
        self.__id = id

    def TEMP(self, temperature: int):
        self.__temperature = temperature
        return self

    def HUMI(self, humidity: int):
        self.__humidity = humidity
        return self

    def EARTH(self, earth_moisture: int):
        self.__earth_moisture = earth_moisture
        return self

    def GDD(self, light_intensity: int):
        self.__light_intensity = light_intensity
        return self

    def LED(self, LED: int):
        self.__LED = LED
        return self

    def PUMP(self, water_pump: int):
        self.__water_pump = water_pump
        return self

    def __str__(self):
        return {
            "sensorId": self.__id,
            "readTimestamp": self.__timestamp,
            "location": self.__location,
            "sensorValue": {
                "temperature": self.__temperature,
                "humidity": self.__humidity,
                "earthMoisture": self.__earth_moisture,
                "lightIntensity": self.__light_intensity,
                "LED": self.__LED,
                "waterPump": self.__water_pump,
            }
        }

    def json_builder(self):
        return json.dumps(self.__str__())


class SerialComm:
    def __init__(self):
        # Create a server connecting to the YoloBit
        self.buffer = ""
        self.nodes = []
        self.serial_protocol = serial.Serial(
            port=self.get_port(), baudrate=115200)

    def get_port(self):
        """ Lists serial port names

            :raises EnvironmentError:
                On unsupported or unknown platforms
            :returns:
                A list of the serial ports available on the system
        """
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.usbmodem[0-9]*')
        else:
            raise EnvironmentError('Unsupported platform')

        result = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result.append(port)
            except (OSError, serial.SerialException):
                pass
        if len(result) == 0:
            raise RuntimeError("No Available Port")
        return result[0]

    def read_serial(self):
        bytesToRead = self.serial_protocol.inWaiting()
        if bytesToRead > 0:
            self.buffer += self.serial_protocol.read(
                bytesToRead).decode("UTF-8")
            while (("!" in self.buffer) and ("#" in self.buffer)):
                start, end = int(self.buffer.find("!")), int(
                    self.buffer.find("#"))
                self.digest_buffer(self.buffer[start: end + 1])
                # In case of sending too much message at one time
                time.sleep(1)
                if (end == len(self.buffer)):
                    self.buffer = ""
                else:
                    self.buffer = self.buffer[end + 1:]

    # A function to process and extract the value of the received data
    def digest_buffer(self, buffer: str):
        # Remove start and end characters
        # Split data from ":"
        # Separate the data to : ID - FIELD - VALUE
        chunks = buffer.replace("!", "").replace("#", "").split(":")
        if chunks != 3:
            raise BufferError(buffer)
        id, field, value = chunks
        found = [node.id for node in self.nodes].find(id)
        if found == -1:
            self.nodes.append(SensorBuilder().id(id))
        if hasattr(self.sensor[found], field):
            eval(f"self.data.{field}({value})")

    def write_serial(self, msg):
        self.serial_protocol.write((str(msg) + "#").encode())



class Gateway:
    def __init__(self, id: int, topic: str, broker: str = 'broker.hivemq.com', port: int = 1883):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.timeout = 1
        self.client_id = "gateway-{id}"
        self.client = None
        # username = 'emqx'
        # password = 'public'

    def connect_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)

        self.client = mqtt_client.Client(self.client_id)
        # client.username_pw_set(username, password)
        self.client.on_connect = on_connect
        self.client.connect(self.broker, self.port)
        self.client.loop_start()

    def publish(self, data: SensorBuilder):
        msg_count = 0
        while True:
            time.sleep(self.timeout)
            msg = data.json_builder()
            result = self.client.publish(self.topic, msg)
            # result: [0, 1]
            status = result[0]
            if status == 0:
                print(f"Send `{msg}` to topic `{self.topic}`")
            else:
                print(f"Failed to send message to topic {self.topic}")
            msg_count += 1


TOPIC = ""


def run():
    serialComm = SerialComm()
    gateway = Gateway(TOPIC)
    gateway.connect_mqtt()
    serialComm.read_serial()
    gateway.publish()


if __name__ == '__main__':
    run()
