import cv2
import numpy as np
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import mediapipe as mp
import threading
import time
import os

app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7,
    model_complexity=1,
)
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

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
        "joints": ("hip", "knee", "ankle"),
        "down_angle": 90,
        "up_angle": 160,
        "feedback": {
            "back": "Keep your back straight!",
            "down": "Go DOWN — push hips back",
            "up": "Stand UP tall",
            "good": "Great form!",
            "rep": "Rep counted!",
        },
    },
    "curl": {
        "name": "Bicep Curl",
        "joints": ("shoulder", "elbow", "wrist"),
        "down_angle": 120,
        "up_angle": 30,
        "feedback": {
            "down": "Lower the weight slowly",
            "up": "Curl UP!",
            "good": "Controlled movement",
            "rep": "Rep counted!",
        },
    },
    "pushup": {
        "name": "Push-Up",
        "joints": ("shoulder", "elbow", "wrist"),
        "down_angle": 90,
        "up_angle": 140,
        "feedback": {
            "back": "Keep your body straight!",
            "down": "Lower chest to floor",
            "up": "Push UP!",
            "good": "Solid form",
            "rep": "Rep counted!",
        },
    },
}

def get_landmark(landmarks, idx):
    return np.array([landmarks[idx].x, landmarks[idx].y])

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
            state.feedback = cfg["feedback"]["good"]
            state.status = "Correct"

            if state.exercise == "squat":
                angle = calculate_angle(l_hip, l_knee, l_ankle)
                state.angle = angle

                if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                    state.feedback = cfg["feedback"]["back"]
                    state.status = "Incorrect"

                if angle < cfg["down_angle"]:
                    state.phase = "DOWN"
                    state.cycle_ready = True
                    if state.status == "Correct":
                        state.feedback = "Rise UP — drive through heels"
                elif angle > cfg["up_angle"] and state.cycle_ready:
                    state.phase = "UP"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = cfg["feedback"]["rep"]

            elif state.exercise == "curl":
                angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
                state.angle = angle

                if angle < cfg["up_angle"]:
                    state.phase = "UP"
                    state.cycle_ready = True
                    state.feedback = cfg["feedback"]["down"]
                elif angle > cfg["down_angle"] and state.cycle_ready:
                    state.phase = "DOWN"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = cfg["feedback"]["rep"]

            elif state.exercise == "pushup":
                angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
                state.angle = angle

                if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                    state.feedback = cfg["feedback"]["back"]
                    state.status = "Incorrect"

                if angle < cfg["down_angle"]:
                    state.phase = "DOWN"
                    state.cycle_ready = True
                    if state.status == "Correct":
                        state.feedback = cfg["feedback"]["up"]
                elif angle > cfg["up_angle"] and state.cycle_ready:
                    state.phase = "UP"
                    state.reps += 1
                    state.cycle_ready = False
                    state.feedback = cfg["feedback"]["rep"]

    except Exception as e:
        print(f"[process_exercise] {e}")

def generate_frames():
    global state
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("[ERROR] Cannot access webcam!")
        return

    fps_start = time.time()
    fps_frames = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False

        results = pose.process(rgb)

        rgb.flags.writeable = True

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
            )
            process_exercise(results.pose_landmarks.landmark)

            with state_lock:
                angle_text = f"Angle: {int(state.angle)}"
                rep_text = f"Reps: {state.reps}"
                status_text = state.status if state.status == "Correct" else "Fix Form"

            cv2.putText(frame, angle_text, (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 229, 255), 2)
            cv2.putText(frame, rep_text, (20, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            color = (0, 200, 0) if state.status == "Correct" else (0, 0, 200)
            cv2.putText(frame, status_text, (20, 120),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        else:
            cv2.putText(frame, "No body detected - stand in view", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 2)
            with state_lock:
                if state.status != "Waiting":
                    state.feedback = "Step into camera view"
                    state.status = "Waiting"

        fps_frames += 1
        elapsed = time.time() - fps_start
        if elapsed >= 1.0:
            fps_start = time.time()
            fps_frames = 0

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

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

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("=" * 50)
    print("  FitSphere AI Trainer Backend")
    print("  Running on http://0.0.0.0:5000")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
