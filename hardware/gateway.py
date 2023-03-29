import paho.mqtt.client as mqtt
import random
import time
import sys
from datetime import datetime
import serial.tools.list_ports
import glob
import signal
import json

host = "localhost"
port = 1883
name = "chill-topic"
password = ""
feed = ["Temperature", "Humidity", "LED",
        "Water Pump", "Timestamp", "Earth Moisture", "GDD"]
feed_format = ["TEMP", "HUMID", "LED", "PUMP", "TIMESTAMP", "EARTH", "GDD"]

# Sensor 1 info
sensor_1 = {
    "sensorId": 1,
    "readTimestamp": "",
    "location": [10.41115, 106.95474],
    "sensorValue": {
        "temperature": 0,
        "humidity": 0,
        "earthMoisture": 0,
        "lightIntensity": 0,
        "LED": 0,
        "waterPump": 0,
    }
}

connected_flag = False


def mqtt_connected(client, userdata, flags, rc):
    print("Connected succesfully!!")
    connected_flag = True
    client.subscribe("LED")
    client.subscribe("Water Pump")
    client.subscribe(name)


def mqtt_subscribed(client, userdata, mid, granted_qos):
    print("Subscribed to Topic!!!")


def message(client, feed_id, message):
    print("New data :", message.payload.decode())
    pass


def disconnect(client):
    print("Connection interrupted !")
    sys.exit(1)

def signal_handler(signal, frame):
    print('You pressed Ctrl+C!')
    sys.exit(0)

def getPort():
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
        ports = glob.glob('/dev/tty.usbserial-[0-9]*')
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


# Register MQTT server
mqttClient = mqtt.Client()
mqttClient.username_pw_set(name, password)
mqttClient.connect(host, int(port), 60)
mqttClient.on_connect = mqtt_connected
mqttClient.on_subscribe = mqtt_subscribed
mqttClient.on_message = message
mqttClient.on_disconnect = disconnect

# Create a server connecting to the YoloBit
isMicrobitConnected = False
if getPort() != "None":
    ser = serial.Serial(port=getPort(), baudrate=115200)
    isMicrobitConnected = True

# A function to process and extract the value of the received data


def processData(data: str):
    # Remove start and end characters
    data = data.replace("!", "").replace("#", "")
    print("here")
    # Split data from ":"
    # Separate the data to : ID - FIELD - VALUE
    sensor_id, feed_data, feed_value = data.split(":")
    sensor_1["sensor_id"] = int(sensor_id)  # The type of ID is an integer
    feed_data = feed[feed_format.index(feed_data)]
    sensor_1["sensorValue"][feed_data] = feed_value
    if (feed_data == "LED" or "Water Pump"):
        mqttClient.publish(feed_data, feed_value)


# A function that make the gateway to read the serial data of the microbit
mess = ""


def readSerial():
    bytesToRead = ser.inWaiting()
    if bytesToRead > 0:
        global mess
        mess += ser.read(bytesToRead).decode("UTF-8")
        while (("!" in mess) and ("#" in mess)):
            start, end = int(mess.find("!")), int(mess.find("#"))
            processData(mess[start: end + 1])
            time.sleep(1)  # In case of sending too much message at one time
            if (end == len(mess)):
                mess = ""
            else:
                mess = mess[end + 1:]


def JSON_generate(str):
    return str


def send_to_server(info):
    sensor_1["readTimestamp"] = datetime.now().isoformat(sep=" ")
    mqttClient.publish(name, json.dumps(sensor_1))

signal.signal(signal.SIGINT, signal_handler)

# Interval of sending the data to the server

mqttClient.loop_start()

while not connected_flag:  # Wait in loop
    minute_now = datetime.now().minute
    if isMicrobitConnected:
        readSerial()

        send_to_server(sensor_1)
    time.sleep(1)

mqttClient.loop_stop()  # Stop loop
mqttClient.disconnect()  # Disconnect



