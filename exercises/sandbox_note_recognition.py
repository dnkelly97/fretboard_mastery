import aubio
import numpy as np
import time
import pyaudio


## pitch detection code based on solution posted here:
## https://github.com/aubio/aubio/issues/78#issuecomment-268632493

# PyAudio object.
p = pyaudio.PyAudio()

# Open stream.
stream = p.open(format=pyaudio.paFloat32,
    channels=1, rate=44100, input=True,
    frames_per_buffer=1024)


buffer_size = 2048
hop_size = buffer_size//2
# Aubio's pitch detection.
pDetection = aubio.pitch("default", buffer_size, hop_size, 44100)
# Set unit.
pDetection.set_unit("Hz")
pDetection.set_silence(-40)
start = time.time()
target_freq = 329.628
epsilon = 8
target_acquired = False

while not target_acquired:

    data = stream.read(hop_size)
    samples = np.fromstring(data, dtype=aubio.float_type)
    pitch = pDetection(samples)[0]
    # Compute the energy (volume) of the
    # current frame.
    volume = np.sum(samples**2)/len(samples)
    # Format the volume output so that at most
    # it has six decimal numbers.
    volume = "{:.6f}".format(volume)

    if pitch > 0:
        print(f"Pitch: {pitch}")

    if target_freq - epsilon <= pitch <= target_freq + epsilon:
        target_acquired = True
        print('final pitch:', pitch)

    # if (time.time() - start) > 0.99:
    #     print(pitch)
    #     print(volume)
    #     start = time.time()
    #     print()

