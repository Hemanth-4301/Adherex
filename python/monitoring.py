# -- coding: utf-8 --
"""
Created on Thu Oct 30 13:43:23 2025

@author: anush
Updated for MongoDB integration
"""
import random
import tkinter as tk
from tkinter import ttk, messagebox
from pymongo import MongoClient
from bson.objectid import ObjectId
import threading
import paho.mqtt.client as mqtt
from datetime import datetime

# ----------------- MQTT CONFIG -----------------
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "medicalblister"
MQTT_THRESHOLD = 4          # trigger when >= 4 messages
MQTT_RESET_INTERVAL = 5     # seconds window

# ----------------- MONGODB CONFIG -----------------
MONGODB_URI = "mongodb+srv://unknownsole123:unknownsole123@dsa01.mpkah2e.mongodb.net/adherex?retryWrites=true&w=majority&appName=dsa01"
DB_NAME = "adherex"

# ----------------- DB FUNCTIONS -----------------
def get_db():
    """Get MongoDB database connection"""
    client = MongoClient(MONGODB_URI)
    return client[DB_NAME]

def fetch_patients():
    """Fetch all patients from MongoDB"""
    db = get_db()
    patients_collection = db['patients']
    patients = list(patients_collection.find({}, {'_id': 1, 'name': 1}).sort('name', 1))
    return [(str(p['_id']), p['name']) for p in patients]

def fetch_tablets_for_pid(pid):
    """Fetch all medications for a patient from MongoDB"""
    db = get_db()
    medications_collection = db['medications']
    medications = list(medications_collection.find({'patient': ObjectId(pid)}, {'_id': 1, 'tableName': 1}))
    return [(str(m['_id']), m['tableName']) for m in medications]

def insert_consumed(m_id):
    """Insert consumed record into MongoDB"""
    db = get_db()
    consumed_collection = db['consumeds']
    consumed_collection.insert_one({
        'dateTime': datetime.now(),
        'medication': ObjectId(m_id),
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    })

# ----------------- MAIN APP -----------------
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Smart Blister - MQTT Integration (MongoDB)")
        self.geometry("650x500")
        self.resizable(False, False)
        self.mqtt_client = None
        self.msg_count = 0
        self.mqtt_lock = threading.Lock()

        self.patients = []
        self.pid_by_display = {}
        self.current_pid = None
        self.tablets = []

        self.create_widgets()
        self.load_patients()
        self.start_mqtt()
        self.start_reset_timer()

    # ----------------- UI -----------------
    def create_widgets(self):
        top = ttk.Frame(self, padding=12)
        top.pack(fill="x")
        ttk.Label(top, text="Select Patient:").grid(row=0, column=0, sticky="w")
        self.cbo_patient = ttk.Combobox(top, width=40, state="readonly")
        self.cbo_patient.grid(row=0, column=1, padx=(8,0))
        self.cbo_patient.bind("<<ComboboxSelected>>", self.on_patient_selected)

        pid_frame = ttk.Frame(self, padding=10)
        pid_frame.pack(fill="x")
        ttk.Label(pid_frame, text="PID:").grid(row=0, column=0)
        self.lbl_pid = ttk.Label(pid_frame, text="-")
        self.lbl_pid.grid(row=0, column=1, padx=(5,0))

        frm_mid = ttk.LabelFrame(self, text="Tablets", padding=10)
        frm_mid.pack(fill="both", expand=True, padx=12, pady=6)
        self.lst_tablets = tk.Listbox(frm_mid, height=10)
        self.lst_tablets.pack(fill="both", expand=True)

        act = ttk.Frame(self, padding=10)
        act.pack(fill="x")
        self.btn_pick = ttk.Button(act, text="Pick Random Tablet", command=self.pick_random)
        self.btn_pick.grid(row=0, column=0)
        ttk.Label(act, text="Selected:").grid(row=0, column=1, padx=(15,5))
        self.lbl_random = ttk.Label(act, text="-", foreground="#1a73e8")
        self.lbl_random.grid(row=0, column=2)

        mqtt_frame = ttk.LabelFrame(self, text="MQTT Live Log", padding=8)
        mqtt_frame.pack(fill="both", expand=True, padx=12, pady=8)
        self.txt_mqtt = tk.Text(mqtt_frame, height=7, wrap="word", state="disabled")
        self.txt_mqtt.pack(fill="both", expand=True)

        self.var_status = tk.StringVar(value="Ready.")
        ttk.Label(self, textvariable=self.var_status, relief="sunken", anchor="w").pack(fill="x", side="bottom")

    # ----------------- LOAD DATA -----------------
    def set_status(self, msg):
        self.var_status.set(msg)
        self.update_idletasks()

    def log_mqtt(self, text):
        self.txt_mqtt.config(state="normal")
        self.txt_mqtt.insert(tk.END, text + "\n")
        self.txt_mqtt.config(state="disabled")
        self.txt_mqtt.see(tk.END)

    def load_patients(self):
        try:
            self.patients = fetch_patients()
            display = []
            for pid, name in self.patients:
                d = f"{name} (ID:{pid})"
                self.pid_by_display[d] = pid
                display.append(d)
            if display:
                self.cbo_patient["values"] = display
                self.cbo_patient.set(display[0])
                self.on_patient_selected()
        except Exception as e:
            messagebox.showerror("DB Error", str(e))

    def on_patient_selected(self, event=None):
        display = self.cbo_patient.get()
        self.current_pid = self.pid_by_display.get(display)
        self.lbl_pid.config(text=str(self.current_pid))
        self.load_tablets()

    def load_tablets(self):
        try:
            self.tablets = fetch_tablets_for_pid(self.current_pid)
            self.lst_tablets.delete(0, tk.END)
            for mid, tname in self.tablets:
                self.lst_tablets.insert(tk.END, f"{tname} (MID:{mid})")
        except Exception as e:
            messagebox.showerror("DB Error", str(e))

    # ----------------- RANDOM PICK + DB -----------------
    def pick_random(self):
        if not self.tablets:
            self.log_mqtt("No tablets loaded for this patient.")
            return
        mid, tablet_name = random.choice(self.tablets)
        self.lbl_random.config(text=tablet_name)
        insert_consumed(mid)
        self.log_mqtt(f"Consumed recorded → {tablet_name} at {datetime.now().strftime('%H:%M:%S')}")

    # ----------------- MQTT -----------------
    def on_mqtt_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.log_mqtt(f"Connected to {MQTT_BROKER}, subscribed to '{MQTT_TOPIC}'")
            client.subscribe(MQTT_TOPIC)
        else:
            self.log_mqtt(f"MQTT connection failed (code {rc})")

    def on_mqtt_message(self, client, userdata, msg):
        payload = msg.payload.decode()
        self.log_mqtt(f"Received: {payload}")
        with self.mqtt_lock:
            self.msg_count += 1
            if self.msg_count >= MQTT_THRESHOLD:
                self.log_mqtt(f"Threshold reached ({self.msg_count}). Triggering random pick.")
                self.msg_count = 0
                self.pick_random()

    def start_mqtt(self):
        def mqtt_thread():
            client = mqtt.Client()
            client.on_connect = self.on_mqtt_connect
            client.on_message = self.on_mqtt_message
            try:
                client.connect(MQTT_BROKER, MQTT_PORT, 60)
                self.mqtt_client = client
                client.loop_forever()
            except Exception as e:
                self.log_mqtt(f"MQTT connection error: {e}")
        threading.Thread(target=mqtt_thread, daemon=True).start()

    # ----------------- TIMER -----------------
    def start_reset_timer(self):
        def reset_loop():
            while True:
                threading.Event().wait(MQTT_RESET_INTERVAL)
                with self.mqtt_lock:
                    if self.msg_count > 0:
                        self.log_mqtt(f"Reset counter (received {self.msg_count} in last {MQTT_RESET_INTERVAL}s)")
                    self.msg_count = 0
        threading.Thread(target=reset_loop, daemon=True).start()

# ----------------- MAIN -----------------
if __name__ == "__main__":
    app = App()
    app.mainloop()
