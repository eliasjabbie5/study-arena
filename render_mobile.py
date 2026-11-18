import asyncio
import os
import shutil
import subprocess
import time
from playwright.async_api import async_playwright

WORKSPACE = "/Users/eliasjabbie/.gemini/antigravity/scratch/study-arena-package/study-arena"
ARTIFACT_DIR = "/Users/eliasjabbie/.gemini/antigravity/brain/4588cb6b-fbee-45a6-880b-bf5793cdf4e4"
TEMP_DIR = "/tmp/pw_mobile_record"
FFMPEG = "/Library/Frameworks/Python.framework/Versions/3.15/lib/python3.15/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v9.0"

async def record_mobile():
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    html_path = os.path.join(WORKSPACE, "mobile_video_export.html")
    print(f"Loading {html_path}...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            args=[
                "--no-sandbox",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
                "--hide-scrollbars"
            ]
        )
        ctx = await browser.new_context(
            viewport={"width": 1080, "height": 1920},
            record_video_dir=TEMP_DIR,
            record_video_size={"width": 1080, "height": 1920}
        )
        page = await ctx.new_page()
        await page.goto(f"file://{html_path}")
        
        print("Recording mobile video (31 seconds)...")
        start = time.time()
        while time.time() - start < 32.0:
            finished = await page.evaluate("() => window.videoFinished === true")
            if finished:
                print(f"Mobile video finished detected at {time.time() - start:.2f}s")
                break
            await asyncio.sleep(0.5)
            
        await page.close()
        await ctx.close()
        await browser.close()
        
    webm_files = [f for f in os.listdir(TEMP_DIR) if f.endswith(".webm")]
    if not webm_files:
        raise RuntimeError("No recorded mobile webm found!")
    
    raw_webm = os.path.join(TEMP_DIR, webm_files[0])
    out_mp4 = os.path.join(WORKSPACE, "study-arena-mobile-9x16.mp4")
    print(f"Transcoding {raw_webm} to Apple QuickTime-compatible MP4: {out_mp4}...")
    
    cmd = [
        FFMPEG, "-y",
        "-i", raw_webm,
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        out_mp4
    ]
    subprocess.run(cmd, check=True)
    print(f"Exported mobile video successfully! File size: {os.path.getsize(out_mp4)} bytes")
    
    # Copy to Desktop, Downloads, and Artifact Dir
    home = os.path.expanduser("~")
    dest_desktop = os.path.join(home, "Desktop", "study-arena-mobile-9x16.mp4")
    dest_downloads = os.path.join(home, "Downloads", "study-arena-mobile-9x16.mp4")
    dest_artifact = os.path.join(ARTIFACT_DIR, "study-arena-mobile-9x16.mp4")
    
    shutil.copy2(out_mp4, dest_desktop)
    shutil.copy2(out_mp4, dest_downloads)
    shutil.copy2(out_mp4, dest_artifact)
    print(f"Copied mobile MP4 to Desktop, Downloads, and Artifact directory.")

if __name__ == "__main__":
    asyncio.run(record_mobile())
