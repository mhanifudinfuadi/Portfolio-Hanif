"""Ganti password admin portfolio.

Pakai:
    cd backend
    python3 set_admin_password.py

Pilihan:
    --dry-run   Hanya mencetak hash, tidak mengubah .env

Aturan password: minimal 6 karakter, hanya huruf dan angka (a-z, A-Z, 0-9).
Password tidak pernah disimpan dalam bentuk teks asli; hanya hash PBKDF2-SHA256
yang ditulis ke backend/.env sebagai ADMIN_PASSWORD_HASH.
"""

import argparse
import base64
import hashlib
import os
import re
import secrets
import sys
from pathlib import Path

ENV_FILE = Path(__file__).parent / ".env"
ITERATIONS = 600_000
MIN_LENGTH = 6
MAX_LENGTH = 128
PASSWORD_RULES = "minimal 6 karakter, hanya huruf dan angka (a-z, A-Z, 0-9)"


def read_password(prompt: str) -> str:
    import getpass

    try:
        return getpass.getpass(prompt)
    except (EOFError, KeyboardInterrupt):
        print("\nDibatalkan.")
        raise SystemExit(130)


def validate(password: str) -> str:
    if not MIN_LENGTH <= len(password) <= MAX_LENGTH:
        raise SystemExit(f"Password harus {MIN_LENGTH}-{MAX_LENGTH} karakter.")
    if not password.isascii() or not password.isalnum():
        raise SystemExit(f"Password hanya boleh berisi huruf dan angka. ({PASSWORD_RULES})")
    if not any(char.isalpha() for char in password):
        raise SystemExit("Password harus memuat minimal satu huruf.")
    if not any(char.isdigit() for char in password):
        raise SystemExit("Password harus memuat minimal satu angka.")
    return password


def make_hash(password: str) -> str:
    salt = secrets.token_urlsafe(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERATIONS
    )
    encoded = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return f"pbkdf2_sha256${ITERATIONS}${salt}${encoded}"


def upsert(lines: list[str], key: str, value: str) -> list[str]:
    """Ganti baris KEY=... yang sudah ada, atau tambahkan bila belum ada."""
    replaced = False
    for index, line in enumerate(lines):
        if line.strip().startswith(f"{key}="):
            lines[index] = f"{key}={value}"
            replaced = True
            break
    if not replaced:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append(f"{key}={value}")
    return lines


def main() -> None:
    parser = argparse.ArgumentParser(description="Ganti password admin portfolio")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="hanya mencetak hash, tidak mengubah .env",
    )
    args = parser.parse_args()

    password = validate(read_password("Password baru: "))
    confirmation = validate(read_password("Ulangi password baru: "))
    if password != confirmation:
        raise SystemExit("Konfirmasi tidak sama. Ulangi.")

    password_hash = make_hash(password)

    if args.dry_run:
        print(f"\nDRY RUN - .env tidak diubah.\nADMIN_PASSWORD_HASH={password_hash}\n")
        return

    if not ENV_FILE.exists():
        raise SystemExit(f"{ENV_FILE} tidak ditemukan.")

    lines = ENV_FILE.read_text(encoding="utf-8").splitlines()
    for key, value in (
        ("ADMIN_EMAIL", "mhanifudinfuadi@gmail.com"),
        ("ADMIN_NAME", "Hanif"),
        ("ADMIN_PASSWORD_HASH", password_hash),
        ("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:3001"),
        ("COOKIE_SECURE", "false"),
    ):
        if key != "ADMIN_PASSWORD_HASH" and any(
            line.strip().startswith(f"{key}=") for line in lines
        ):
            continue
        lines = upsert(lines, key, value)

    ENV_FILE.write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")

    email = next(
        (line.split("=", 1)[1] for line in lines if line.strip().startswith("ADMIN_EMAIL=")),
        "-",
    )
    print(f"\nPassword diperbarui untuk {email}.")
    print("Semua sesi lama otomatis tidak berlaku.")
    print("Restart API agar perubahan terpakai:")
    print("    cd backend && venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001")
    print()


if __name__ == "__main__":
    main()