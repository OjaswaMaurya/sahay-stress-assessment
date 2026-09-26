COUNSELOR_EMAILS = {
    "anshanjali7588@gmail.com",
    "ojaswamaurya0509@gmail.com",
}


def is_counselor(email: str) -> bool:
    return email.strip().lower() in COUNSELOR_EMAILS