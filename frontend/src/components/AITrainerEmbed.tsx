import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Dumbbell, Activity, Target, ChevronDown, WifiOff, Smartphone, RefreshCw } from 'lucide-react';
import { PoseLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';

type Exercise = 'squat' | 'pushup' | 'curl';

const EXERCISE_META: Record<Exercise, { label: string; icon: string }> = {
  squat: { label: 'Squat', icon: '🦵' },
  pushup: { label: 'Push-Up', icon: '💪' },
  curl: { label: 'Bicep Curl', icon: '🏋️' },
};

function calcAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const ax = a.x - b.x, ay = a.y - b.y;
  const cx = c.x - b.x, cy = c.y - b.y;
  const dot = ax * cx + ay * cy;
  const mag = Math.sqrt(ax * ax + ay * ay) * Math.sqrt(cx * cx + cy * cy);
  const angle = Math.acos(Math.min(1, Math.max(-1, dot / mag)));
  return angle * (180 / Math.PI);
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && window.innerWidth < 768);
}

export function AITrainerEmbed() {
  const mobile = isMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animRef = useRef<number>(0);
  const frameSkipRef = useRef(0);

  const [status, setStatus] = useState<string>('Tap to start camera');
  const [exercise, setExercise] = useState<Exercise>('squat');
  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState('Tap the button below to start');
  const [posture, setPosture] = useState<'Good' | 'Fix' | 'Waiting'>('Waiting');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [expanded, setExpanded] = useState(!mobile);
  const [modelReady, setModelReady] = useState(false);

  const phaseRef = useRef(false);
  const repCountRef = useRef(0);

  const drawSkeleton = useCallback((landmarks: NormalizedLandmark[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const connections: [number, number][] = [
      [11, 12], [12, 14], [14, 16], [11, 13], [13, 15],
      [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
      [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
      [27, 31], [28, 32],
    ];

    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = mobile ? 2 : 3;
    for (const [i, j] of connections) {
      const a = landmarks[i], b = landmarks[j];
      if (a && b && a.visibility && a.visibility > 0.5 && b.visibility && b.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#00E5FF';
    const dotRadius = mobile ? 3 : 5;
    for (const lm of landmarks) {
      if (lm.visibility && lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [mobile]);

  const detectExercise = useCallback((landmarks: NormalizedLandmark[]) => {
    const get = (i: number) => landmarks[i];

    const shoulder = get(11), elbow = get(13), wrist = get(15);
    const hip = get(23), knee = get(25), ankle = get(27);

    let currentAngle = 0;
    let good = true;
    let msg = 'Good form!';
    let postureState: 'Good' | 'Fix' = 'Good';

    if (exercise === 'squat') {
      currentAngle = calcAngle(hip, knee, ankle);
      if (Math.abs(shoulder.x - hip.x) > 0.08) {
        msg = 'Keep your back straight!'; good = false; postureState = 'Fix';
      }
      if (currentAngle < 90) {
        phaseRef.current = true;
        if (good) msg = 'Rise UP — drive through heels';
      } else if (currentAngle > 155 && phaseRef.current) {
        phaseRef.current = false;
        repCountRef.current += 1;
        setReps(repCountRef.current);
        msg = 'Rep counted!';
      }
    } else if (exercise === 'curl') {
      currentAngle = calcAngle(shoulder, elbow, wrist);
      if (currentAngle < 30) {
        phaseRef.current = true;
        msg = 'Lower the weight slowly';
      } else if (currentAngle > 120 && phaseRef.current) {
        phaseRef.current = false;
        repCountRef.current += 1;
        setReps(repCountRef.current);
        msg = 'Rep counted!';
      }
    } else if (exercise === 'pushup') {
      currentAngle = calcAngle(shoulder, elbow, wrist);
      if (Math.abs(shoulder.x - hip.x) > 0.08) {
        msg = 'Keep body straight!'; good = false; postureState = 'Fix';
      }
      if (currentAngle < 90) {
        phaseRef.current = true;
        if (good) msg = 'Push UP now!';
      } else if (currentAngle > 140 && phaseRef.current) {
        phaseRef.current = false;
        repCountRef.current += 1;
        setReps(repCountRef.current);
        msg = 'Rep counted!';
      }
    }

    setAngle(Math.round(currentAngle));
    setFeedback(msg);
    setPosture(postureState);
  }, [exercise]);

  const predictLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      animRef.current = requestAnimationFrame(predictLoop);
      return;
    }

    frameSkipRef.current += 1;
    if (mobile && frameSkipRef.current % 3 !== 0) {
      animRef.current = requestAnimationFrame(predictLoop);
      return;
    }

    const ts = performance.now();
    let results;
    try {
      results = landmarker.detectForVideo(video, ts);
    } catch (err) {
      console.error('[AITrainer] detectForVideo error:', err);
      animRef.current = requestAnimationFrame(predictLoop);
      return;
    }
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      drawSkeleton(landmarks);
      detectExercise(landmarks);
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setFeedback('No body detected');
      setPosture('Waiting');
    }

    animRef.current = requestAnimationFrame(predictLoop);
  }, [drawSkeleton, detectExercise, mobile]);

  const startCamera = useCallback(async () => {
    setCameraDenied(false);
    setStatus('Starting camera...');

    const tryGetStream = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      return navigator.mediaDevices.getUserMedia(constraints);
    };

    try {
      let stream: MediaStream;
      try {
        stream = await tryGetStream({ video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } }, audio: false });
      } catch {
        console.warn('[AITrainer] Preferred constraints failed, trying minimal');
        try {
          stream = await tryGetStream({ video: { facingMode: 'user' }, audio: false });
        } catch {
          console.warn('[AITrainer] facingMode failed, trying any video');
          stream = await tryGetStream({ video: true, audio: false });
        }
      }

      if (!videoRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        videoRef.current!.onloadedmetadata = () => {
          videoRef.current!.play()
            .then(() => resolve())
            .catch(reject);
        };
        videoRef.current!.onerror = () => reject(new Error('Video element error'));
      });
      setCameraOn(true);
      setCameraDenied(false);
      setStatus('Ready');
      setFeedback('Step back so your full body is visible');
      animRef.current = requestAnimationFrame(predictLoop);
    } catch (err: any) {
      console.error('[AITrainer] Camera start failed:', err);
      setCameraOn(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraDenied(true);
        setStatus('Camera blocked');
        setFeedback('Tap below to learn how to unblock');
      } else if (err.name === 'NotFoundError') {
        setStatus('No camera found');
        setFeedback('This device has no camera');
      } else {
        setStatus('Camera error');
        setFeedback('Could not start camera. Tap to retry.');
      }
    }
  }, [predictLoop]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setStatus('Loading AI model...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        );
        if (cancelled) return;
        let landmarker: PoseLandmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          console.warn('[AITrainer] GPU delegate failed, falling back to CPU');
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setModelReady(true);
        setStatus('Model loaded — tap to start camera');
        setFeedback('Ready! Tap the button to enable your camera');
      } catch (e) {
        console.error('[AITrainer] Model failed to load:', e);
        setStatus('Model failed to load');
        setFeedback('Try refreshing the page');
      }
    };
    init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      landmarkerRef.current?.close();
    };
  }, []);

  const switchExercise = (ex: Exercise) => {
    setExercise(ex);
    repCountRef.current = 0;
    setReps(0);
    phaseRef.current = false;
    setFeedback(`Switched to ${EXERCISE_META[ex].label}`);
    setPosture('Waiting');
  };

  return (
    <div className="rounded-[16px] md:rounded-[24px] bg-white border-2 border-[#191A23] shadow-[4px_4px_0px_#191A23] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 md:gap-4 p-3 md:p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${cameraOn ? 'bg-primary/10' : 'bg-amber-50'}`}>
            <Camera className={`w-4 h-4 md:w-5 md:h-5 ${cameraOn ? 'text-primary' : 'text-amber-500'}`} />
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-black text-[#191A23] text-xs md:text-sm flex items-center gap-1.5 md:gap-2 truncate">
              AI Trainer
              {mobile && !expanded && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold shrink-0">
                  <Smartphone className="w-2.5 h-2.5" />MOBILE
                </span>
              )}
              {cameraOn && (
                <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[8px] md:text-[9px] font-bold border border-green-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />LIVE
                </span>
              )}
              {!cameraOn && cameraDenied && (
                <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[8px] md:text-[9px] font-bold border border-red-200 shrink-0">
                  <WifiOff className="w-2 h-2 md:w-2.5 md:h-2.5" />NO CAMERA
                </span>
              )}
            </h3>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-semibold truncate">
              {status}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 md:px-5 pb-3 md:pb-5 space-y-3 md:space-y-4">
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 md:mx-0 px-3 md:px-0">
            {(Object.entries(EXERCISE_META) as [Exercise, typeof EXERCISE_META[Exercise]][]).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => switchExercise(key)}
                className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 md:py-1.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wider border-2 transition-all shrink-0 touch-manipulation ${
                  exercise === key
                    ? 'bg-primary text-white border-primary shadow-[2px_2px_0px_#191A23]'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-[10px] md:text-xs">{meta.icon}</span>
                {meta.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <div className="rounded-xl bg-black overflow-hidden relative aspect-video border-2 border-slate-800">
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="text-center px-4 md:px-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Camera className="w-5 h-5 md:w-7 md:h-7 text-slate-500" />
                      </div>
                      {cameraDenied ? (
                        <>
                          <p className="text-red-400 font-bold text-xs md:text-sm mb-2">Camera Blocked by Browser</p>
                          <p className="text-slate-500 text-[10px] md:text-[11px] max-w-xs mx-auto leading-relaxed mb-3">
                            Tap the <strong>lock icon</strong> or <strong>camera icon</strong> in your address bar, then set Camera to <strong>"Allow"</strong>. Or:
                          </p>
                          <ol className="text-slate-500 text-[9px] md:text-[10px] text-left max-w-[240px] mx-auto space-y-1 mb-4 list-decimal list-inside">
                            <li>Tap the 3-dot menu in Chrome</li>
                            <li>Tap <strong>Site settings</strong></li>
                            <li>Tap <strong>Camera</strong></li>
                            <li>Find this site and set to <strong>Allow</strong></li>
                            <li>Refresh this page</li>
                          </ol>
                          <button
                            onClick={startCamera}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-primary shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none touch-manipulation"
                          >
                            <RefreshCw className="w-3 h-3" />Retry Camera
                          </button>
                        </>
                      ) : !modelReady ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-slate-300 font-bold text-xs md:text-sm mb-1">Loading pose detection model...</p>
                          <p className="text-slate-500 text-[10px] md:text-[11px]">First load takes ~5 seconds</p>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-300 font-bold text-xs md:text-sm mb-3">Camera Ready</p>
                          <button
                            onClick={startCamera}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-primary shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none touch-manipulation"
                          >
                            <Camera className="w-3 h-3" />Start Camera
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {cameraOn && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/70 backdrop-blur-sm px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 md:gap-1.5">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 md:gap-2.5">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                  <Dumbbell className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                  <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">Exercise</p>
                </div>
                <p className="text-sm md:text-base font-black text-[#191A23]">{EXERCISE_META[exercise].label}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                  <Target className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
                  <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">Reps</p>
                </div>
                <p className="text-sm md:text-base font-black text-[#191A23]">{reps}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                  <Activity className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500" />
                  <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">Angle</p>
                </div>
                <p className="text-sm md:text-base font-black text-amber-500">{angle}°</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                  <Camera className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                  <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">Posture</p>
                </div>
                <p className={`text-[11px] md:text-sm font-black ${posture === 'Good' ? 'text-emerald-600' : posture === 'Fix' ? 'text-red-500' : 'text-slate-400'}`}>
                  {posture === 'Good' ? '✓ Good' : posture === 'Fix' ? '✗ Fix' : '--'}
                </p>
              </div>
              <div className="col-span-2 p-2 md:p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <p className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-wider mb-0.5 md:mb-1">Coach Feedback</p>
                <p className="text-[10px] md:text-xs font-bold text-slate-800 leading-relaxed">{feedback}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}