from html.parser import HTMLParser
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]


class HTMLAuditParser(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.issues = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes = attrs_dict.get("class", "").split()

        if tag == "a" and attrs_dict.get("target") == "_blank":
            rel_tokens = set(attrs_dict.get("rel", "").split())
            if {"noopener", "noreferrer"} - rel_tokens:
                self.issues.append(
                    f"{self.path}: anchor with target=_blank is missing rel=\"noopener noreferrer\""
                )

        if tag == "button" and "ai-btn" in classes:
            has_label = bool(attrs_dict.get("aria-label") or attrs_dict.get("title"))
            if not has_label:
                onclick = attrs_dict.get("onclick", "")
                if not re.search(r"openAI\('[^']+',\s*'[^']+'\)", onclick):
                    self.issues.append(
                        f"{self.path}: AI button is missing an accessible label and provider hint"
                    )


def check_html_files():
    issues = []
    for path in sorted(ROOT.rglob("*.html")):
        parser = HTMLAuditParser(path.relative_to(ROOT))
        parser.feed(path.read_text(encoding="utf-8"))
        issues.extend(parser.issues)
    return issues


def check_index_cards():
    index_path = ROOT / "index.html"
    content = index_path.read_text(encoding="utf-8")
    issues = []
    if "document.createElement('a')" not in content:
        issues.append("index.html: library cards are no longer rendered as anchors")
    if "card.onclick =" in content:
        issues.append("index.html: found mouse-only card click handler")
    return issues


def main():
    issues = []
    issues.extend(check_html_files())
    issues.extend(check_index_cards())

    if issues:
        print("Static accessibility check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Static accessibility check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
