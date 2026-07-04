from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).parent
INDEX = ROOT / "index.html"

st.set_page_config(page_title="Project ODIN", layout="wide", initial_sidebar_state="collapsed")
st.markdown(
    """
    <style>
      header, footer, .stDeployButton { display:none !important; }
      .block-container { padding: 0 !important; max-width: none !important; }
      iframe { width: 100vw !important; height: 100vh !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

html = INDEX.read_text(encoding="utf-8")
# Streamlit cannot serve Vite module paths directly in this wrapper. Use this as a hosting shell
# after running npm build and placing dist assets behind a static route, or use `npm run dev`
# for the true development experience.
components.html(
    f"""
    <div style='height:100vh;background:#04070d;color:#eafcff;display:grid;place-items:center;font-family:system-ui'>
      <div style='max-width:760px;padding:2rem;border:1px solid rgba(126,231,255,.35);background:rgba(5,10,18,.82)'>
        <p style='color:#f2c76d;letter-spacing:.22em;text-transform:uppercase'>Project ODIN Sprint 3</p>
        <h1 style='font-family:Georgia,serif;font-size:3rem;margin:.2rem 0'>WebGL build ready</h1>
        <p>Run <code>npm install</code> then <code>npm run dev</code> for the full playable Three.js experience. Streamlit remains a deployment wrapper, not the primary renderer.</p>
        <p>Files are present in this package and validated by <code>npm run smoke</code>.</p>
      </div>
    </div>
    """,
    height=900,
    scrolling=False,
)
