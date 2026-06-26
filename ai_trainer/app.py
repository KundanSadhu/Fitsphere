import cv2
import numpy as np
from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import mediapipe as mp
import threading
import time
import os
import urllib.request

app = Flask(__name__)
CORS(app)

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
MODEL_PATH = "pose_landmarker_lite.task"

if not os.path.exists(MODEL_PATH):
    print("Downloading Pose Landmarker model...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Model downloaded!")

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.IMAGE,
    min_pose_detection_confidence=0.7,
    min_tracking_confidence=0.7,
)
landmarker = PoseLandmarker.create_from_options(options)

state_lock = threading.Lock()

class TrainerState:
    def __init__(self):
        self.exercise = "squat"
        self.reps = 0
        self.angle = 0.0
        self.feedback = "Stand by..."
        self.status = "Waiting"
        self.phase = "UP"
        self.cycle_ready = False

state = TrainerState()

EXERCISE_CONFIG = {
    "squat": {
        "name": "Squat",
        "down_angle": 90,
        "up_angle": 160,
    },
    "curl": {
        "name": "Bicep Curl",
        "down_angle": 120,
        "up_angle": 30,
    },
    "pushup": {
        "name": "Push-Up",
        "down_angle": 90,
        "up_angle": 140,
    },
}

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return min(angle, 360 - angle)

def process_exercise(landmarks):
    global state
    cfg = EXERCISE_CONFIG.get(state.exercise)
    if not cfg:
        return
    try:
        def lm(idx): return [landmarks[idx].x, landmarks[idx].y]
        l_shoulder, l_elbow, l_wrist = lm(11), lm(13), lm(15)
        l_hip, l_knee, l_ankle = lm(23), lm(25), lm(27)

        with state_lock:
            state.feedback = "Good form!"
            state.status = "Correct"

            if state.exercise == "squat":
                state.angle = calculate_angle(l_hip, l_knee, l_ankle)
                if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                    state.feedback = "Keep your back straight!"
                    state.status = "Incorrect"
                if state.angle < cfg["down_angle"]:
                    state.phase = "DOWN"
                    state.cycle_ready = True
                    if state.status == "Correct":
                        state.feedback = "Rise UP — drive through heels"
                elif state.angle > cfg["up_angle"] and state.cycle_ready:
                    state.phase = "UP"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = "Rep counted!"

            elif state.exercise == "curl":
                state.angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
                if state.angle < cfg["up_angle"]:
                    state.phase = "UP"
                    state.cycle_ready = True
                    state.feedback = "Lower the weight slowly"
                elif state.angle > cfg["down_angle"] and state.cycle_ready:
                    state.phase = "DOWN"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = "Rep counted!"

            elif state.exercise == "pushup":
                state.angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
                if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                    state.feedback = "Keep your body straight!"
                    state.status = "Incorrect"
                if state.angle < cfg["down_angle"]:
                    state.phase = "DOWN"
                    state.cycle_ready = True
                    if state.status == "Correct":
                        state.feedback = "Push UP now!"
                elif state.angle > cfg["up_angle"] and state.cycle_ready:
                    state.phase = "UP"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = "Rep counted!"
    except Exception as e:
        print(f"[process_exercise] {e}")

def draw_skeleton(frame, landmarks):
    connections = mp.tasks.vision.PoseLandmarksConnections.POSE_LANDMARKS
    h, w, _ = frame.shape
    pts = {}
    for i, lm in enumerate(landmarks):
        cx, cy = int(lm.x * w), int(lm.y * h)
        pts[i] = (cx, cy)
        cv2.circle(frame, (cx, cy), 4, (0, 229, 255), -1)
    for conn in connections:
        a, b = conn.start, conn.end
        if a in pts and b in pts:
            cv2.line(frame, pts[a], pts[b], (255, 255, 255), 2)

def generate_frames():
    global state
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    if not cap.isOpened():
        print("[ERROR] Cannot access webcam!")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = landmarker.detect(mp_image)

        if result.pose_landmarks and len(result.pose_landmarks) > 0:
            draw_skeleton(frame, result.pose_landmarks[0])
            process_exercise(result.pose_landmarks[0])
            with state_lock:
                cv2.putText(frame, f"Angle: {int(state.angle)}", (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 229, 255), 2)
                cv2.putText(frame, f"Reps: {state.reps}", (20, 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                color = (0, 200, 0) if state.status == "Correct" else (0, 0, 200)
                cv2.putText(frame, state.status, (20, 120),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        else:
            cv2.putText(frame, "No body detected", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 2)
            with state_lock:
                if state.status != "Waiting":
                    state.feedback = "Step into camera view"
                    state.status = "Waiting"

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_exercise', methods=['POST'])
def set_exercise():
    global state
    data = request.get_json()
    exercise = data.get('exercise', 'squat')
    with state_lock:
        state.exercise = exercise
        state.reps = 0
        state.phase = "UP"
        state.cycle_ready = False
        state.feedback = f"Ready for {EXERCISE_CONFIG[exercise]['name']}"
        state.status = "Waiting"
    return jsonify({"status": "success", "exercise": exercise})

@app.route('/get_stats')
def get_stats():
    global state
    with state_lock:
        return jsonify({
            "exercise": EXERCISE_CONFIG[state.exercise]["name"],
            "reps": state.reps,
            "angle": int(state.angle),
            "feedback": state.feedback,
            "status": state.status,
        })

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("=" * 50)
    print("  FitSphere AI Trainer Backend")
    print("  Running on http://0.0.0.0:5000")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
