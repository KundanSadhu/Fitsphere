import cv2
import numpy as np
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import math
import os
import urllib.request

app = Flask(__name__)
CORS(app)

# Download model if not present
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
MODEL_PATH = "pose_landmarker_lite.task"

if not os.path.exists(MODEL_PATH):
    print("Downloading Pose Landmarker model...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Model downloaded!")

from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core.base_options import BaseOptions
import mediapipe as mp

options = vision.PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=vision.RunningMode.IMAGE,
    min_pose_detection_confidence=0.7,
    min_tracking_confidence=0.7,
)
landmarker = vision.PoseLandmarker.create_from_options(options)

current_exercise = "squat"
rep_count = 0
state = "UP"
angle_value = 0
feedback_msg = "Stand by..."
posture_status = "Waiting"

squat_down = False
curl_down = False
pushup_down = False


def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


def draw_skeleton(frame, landmarks):
    connections = [
        (11, 12), (12, 14), (14, 16), (11, 13), (13, 15),
        (11, 23), (12, 24), (23, 24), (23, 25), (24, 26),
        (25, 27), (26, 28), (27, 29), (28, 30), (29, 31), (30, 32),
        (27, 31), (28, 32), (11, 23), (12, 24)
    ]
    h, w, _ = frame.shape
    pts = {}
    for i, lm in enumerate(landmarks):
        cx, cy = int(lm.x * w), int(lm.y * h)
        pts[i] = (cx, cy)
        cv2.circle(frame, (cx, cy), 3, (0, 229, 255), -1)

    for a, b in connections:
        if a in pts and b in pts:
            cv2.line(frame, pts[a], pts[b], (255, 255, 255), 2)


def process_exercise(landmarks):
    global rep_count, state, feedback_msg, posture_status, angle_value
    global squat_down, curl_down, pushup_down

    try:
        def lm(idx):
            return [landmarks[idx].x, landmarks[idx].y]

        l_shoulder = lm(11)
        l_elbow = lm(13)
        l_wrist = lm(15)
        l_hip = lm(23)
        l_knee = lm(25)
        l_ankle = lm(27)

        feedback_msg = "Good form!"
        posture_status = "Correct"

        if current_exercise == "squat":
            angle_value = calculate_angle(l_hip, l_knee, l_ankle)

            if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                feedback_msg = "Keep your back straight!"
                posture_status = "Incorrect"

            if angle_value < 90:
                state = "DOWN"
                squat_down = True
                if feedback_msg == "Good form!":
                    feedback_msg = "Go UP now!"
            elif angle_value > 160 and squat_down:
                state = "UP"
                rep_count += 1
                squat_down = False
                feedback_msg = "Rep counted!"
                posture_status = "Correct"

        elif current_exercise == "curl":
            angle_value = calculate_angle(l_shoulder, l_elbow, l_wrist)

            if angle_value < 30:
                state = "UP"
                curl_down = True
                feedback_msg = "Extend arm down!"
            elif angle_value > 120 and curl_down:
                state = "DOWN"
                rep_count += 1
                curl_down = False
                feedback_msg = "Rep counted!"
                posture_status = "Correct"

        elif current_exercise == "pushup":
            angle_value = calculate_angle(l_shoulder, l_elbow, l_wrist)

            if abs(l_shoulder[0] - l_hip[0]) > 0.08:
                feedback_msg = "Keep your body straight!"
                posture_status = "Incorrect"

            if angle_value < 90:
                state = "DOWN"
                pushup_down = True
                feedback_msg = "Push UP now!"
            elif angle_value > 140 and pushup_down:
                state = "UP"
                rep_count += 1
                pushup_down = False
                feedback_msg = "Rep counted!"
                posture_status = "Correct"

    except Exception:
        pass


def generate_frames():
    global rep_count, state, angle_value, feedback_msg, posture_status

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Cannot access webcam!")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = landmarker.detect(mp_image)

        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]
            draw_skeleton(frame, landmarks)
            process_exercise(landmarks)

            cv2.putText(frame, f"Angle: {int(angle_value)}", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 229, 255), 2)
            cv2.putText(frame, f"Reps: {rep_count}", (20, 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        else:
            cv2.putText(frame, "No body detected", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/set_exercise', methods=['POST'])
def set_exercise():
    global current_exercise, rep_count, state, squat_down, curl_down, pushup_down
    data = request.get_json()
    exercise = data.get('exercise', 'squat')
    current_exercise = exercise
    rep_count = 0
    state = "UP"
    squat_down = False
    curl_down = False
    pushup_down = False
    return jsonify({"status": "success", "exercise": current_exercise})


@app.route('/get_stats')
def get_stats():
    global rep_count, angle_value, feedback_msg, posture_status, current_exercise
    return jsonify({
        "exercise": current_exercise.capitalize(),
        "reps": rep_count,
        "angle": int(angle_value),
        "feedback": feedback_msg,
        "status": posture_status
    })


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
