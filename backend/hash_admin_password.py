"""Create a PBKDF2 hash for ADMIN_PASSWORD_HASH without echoing the password."""

import base64
import getpass
import hashlib
import secrets


ITERATIONS = 600_000


def main():
    password = getpass.getpass("Admin password (minimum 6 characters, letters and numbers): ")
    confirmation = getpass.getpass("Repeat password: ")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")
    if len(password) < 6:
        raise SystemExit("Choose a password with at least 6 characters.")
    if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
        raise SystemExit("Use at least one letter and one number.")
    if not password.isascii() or not password.isalnum():
        raise SystemExit("Use only letters and numbers.")

    salt = secrets.token_urlsafe(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERATIONS
    )
    encoded = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    print(f"pbkdf2_sha256${ITERATIONS}${salt}${encoded}")


if __name__ == "__main__":
    main()
