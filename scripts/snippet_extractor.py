# -*- coding: utf-8 -*-
from __future__ import annotations
from pathlib import Path
import json
import re
from typing import Dict, Any, Optional, List

ROOT = Path(__file__).resolve().parents[2]   # 项目根目录
PROGRAMS_PATH = ROOT / "public" / "data" / "ucl_programs.json"
SERVICES_PATH = ROOT / "public" / "data" / "ucl_services.json"

_URL_ITEM_INDEX: Dict[str, Dict[str, Any]] = {}
_BUILT = False

INTENT_KEYS = {
    "admission_requirements": ["entry requirements","admission","requirements","grades","gpa","ielts","toefl","qualification","entry criteria"],
    "careers_resume": ["cv","resume","curriculum vitae","career","job","employment","how to","guidance","advice","work"],
    "booking": ["booking","appointment","book","how to access","how to book",">`schedule","contact"],
    "wellbeing_support": ["counselling","mental health","wellbeing","support","urgent","out of hours","contact","appointments","how to access"],
    "other": []
}

FALLBACK_FIELDS = ["description","content","details","info","text","entry_requirements","requirements","how_to_access","contact"]

def _norm(s: str) -> str:
    return re.sub(r'\s+', ' ', s or '').strip()

def _load_json(path: Path) -> List[dict]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _build_index():
    global _BUILT, _URL_ITEM_INDEX
    if _BUILT:
        return
    for p in [PROGRAMS_PATH, SERVICES_PATH]:
        for item in _load_json(p):
            url = item.get("url") or ""
            if url:
                _URL_ITEM_INDEX[url] = item
    _BUILT = True

def _best_sections(item: dict, intent: str, max_sections: int = 2) -> List[str]:
    secs = item.get("sections") or []
    if not secs:
        return []
    keys = INTENT_KEYS.get(intent, [])
    scored = []
    for sec in secs:
        heading = _norm(sec.get("heading","")).lower()
        text    = _norm(sec.get("text",""))
        if not text:
            continue
        score = sum(2 if k in heading else 1 if k in text.lower() else 0 for k in keys)
        if intent == "admission_requirements" and any(x in heading for x in ["entry","requirement","admission"]):
            score += 3
        if intent in ("booking","wellbeing_support") and any(x in heading for x in ["appointment","booking","how to access","counselling","urgent"]):
            score += 3
        scored.append((score, text, heading))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t, _ in scored[:max_sections] if _norm(t)]

def _fallback_text(item: dict) -> Optional[str]:
    for k in FALLBACK_FIELDS:
        v = item.get(k)
        if v and isinstance(v, str) and _norm(v):
            return _norm(v)
    return None

def get_snippet_by_url(url: str, intent: str, max_len: int = 700) -> Optional[str]:
    if not url:
        return None
    _build_index()
    item = _URL_ITEM_INDEX.get(url)
    if not item:
        return None
    chosen: List[str] = []
    chosen.extend(_best_sections(item, intent, max_sections=2))
    if len(chosen) < 1:
        fb = _fallback_text(item)
        if fb:
            chosen.append(fb)
    if not chosen:
        return None
    txt = "\n".join(chosen)
    txt = _norm(txt)
    if len(txt) > max_len:
        txt = txt[:max_len] + "…"
    return txt

def enrich_candidates_with_snippets(cands: List[dict], intent: str, max_each: int = 700) -> List[dict]:
    for c in cands:
        if not c.get("snippet"):
            snip = get_snippet_by_url(c.get("url",""), intent, max_len=max_each)
            if snip:
                c["snippet"] = snip
    return cands