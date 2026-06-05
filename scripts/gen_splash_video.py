import os
from huggingface_hub import InferenceClient

client = InferenceClient(
    provider="fal-ai",
    api_key=os.environ["HF_TOKEN"],
)

prompt = (
    "Dramatic fast-motion timelapse of an epic sky: dark storm clouds racing and swirling "
    "rapidly across the frame, bright lightning bolts flashing, rain sweeping through, "
    "then the clouds break apart and brilliant golden sun rays burst through into a clear blue sky. "
    "Strong dynamic visible movement, fast rolling clouds, cinematic dramatic atmosphere, "
    "high contrast, vivid colors, ultra high quality, 4k"
)

# Uzun video üçün daha çox kadr
kwargs = dict(model="Wan-AI/Wan2.2-TI2V-5B")
try:
    kwargs["num_frames"] = 181
except Exception:
    pass

print("Generating weather-journey video... (this can take several minutes)", flush=True)
try:
    video = client.text_to_video(prompt, **kwargs)
except Exception as e:
    print("retrying without num_frames:", e, flush=True)
    video = client.text_to_video(prompt, model="Wan-AI/Wan2.2-TI2V-5B")

out = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "animations", "splash.mp4"))
with open(out, "wb") as f:
    f.write(video)

print(f"OK saved: {out} ({round(os.path.getsize(out)/1024)} KB)", flush=True)
