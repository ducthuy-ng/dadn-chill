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
    

class SerialReader:
    def __init__(self):
        # Create a server connecting to the YoloBit
        self.buffer = ""
        self.serial_protocol = serial.Serial(port=self.get_port(), baudrate=115200)

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
        print(result)
        return result[0]
    
    def read_serial(self):
        bytesToRead = self.serial_protocol.inWaiting()
        if bytesToRead > 0:
            self.buffer += self.serial_protocol.read(bytesToRead).decode("UTF-8")
            while (("!" in self.buffer) and ("#" in self.buffer)):
                start, end = int(self.buffer.find("!")), int(self.buffer.find("#"))
                self.digest_buffer(self.buffer[start: end + 1])
                time.sleep(1)  # In case of sending too much message at one time
                if (end == len(self.buffer)):
                    self.buffer = ""
                else:
                    self.buffer = self.buffer[end + 1:]
    
    # A function to process and extract the value of the received data
    def digest_buffer(buffer: str):
        # Remove start and end characters
        # Split data from ":"
        # Separate the data to : ID - FIELD - VALUE
        chunks = buffer.replace("!", "").replace("#", "").split(":")
        if chunks != 3:
            raise BufferError(buffer)
        return chunks



class Gateway:
    def __init__(self, topic: str, broker: str = 'broker.hivemq.com', port: int = 1883):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.timeout = 1
        self.client_ids = []
        self.client = []
        # username = 'emqx'
        # password = 'public'

    def connect_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)
        for client_id in self.client_ids:
            client = mqtt_client.Client(client_id)
            # client.username_pw_set(username, password)
            client.on_connect = on_connect
            client.connect(self.broker, self.port)
            self.client.append(client)

    def publish(self):
        msg_count = 0
        while True:
            time.sleep(self.timeout)
            for client, id in self.client ,self.client_ids:
                data = {
                    "sensorId": int(id),
                    "readTimestamp": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    "latlon": [10.41115, 106.95474],
                    "sent": msg_count,
                    "sensorValue": {
                        "temperature": random.randint(290, 320) / 10.0,
                        "humidity": random.randint(60, 100),
                        "earthMoisture": random.randint(60, 100),
                        "lightIntensity": random.randint(800, 1500) / 10.0,
                    }
                }

                msg = f"{json.dumps(data)}"
                result = client.publish(self.topic, msg)
                # result: [0, 1]
                status = result[0]
                if status == 0:
                    print(f"Send `{msg}` to topic `{self.topic}`")
                else:
                    print(f"Failed to send message to topic {self.topic}")
                msg_count += 1

TOPIC=""

if __name__ == '__main__':
    gateway = Gateway(TOPIC)
    
