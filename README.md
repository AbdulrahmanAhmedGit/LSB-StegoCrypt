# LSB-StegoCrypt

#### Video URL: [Youtube Video](https://youtu.be/W-jwMfX0uwg?si=oXtRAB1aplFhzy2f)

## Description
This project is a Command-Line Interface (CLI) application developed in Python for **CS50P (CS50's Introduction to Programming with Python)**. It implements secure **Least Significant Bit (LSB) Steganography** combined with robust **Fernet (AES-128) Symmetric Encryption** and `zlib` data compression.

The primary goal of this tool is to provide an advanced, multi-layered privacy mechanism. It allows users to encrypt a secret text message using a cryptographic key derived from a password, compress the encrypted payload to maximize embedding efficiency, and then seamlessly inject the secret binary stream into the least significant bits of an RGB image's pixel channels. Conversely, the tool can perfectly extract, decompress, and decrypt the hidden message from the stego-image, provided the user supplies the correct authentication password.

### Key Features
1. **Strong Encryption:** Uses the `cryptography` library's Fernet implementation, ensures data cannot be read even if extracted from the image without the key.
2. **Data Compression:** Integrates `zlib` compression to minimize the message bit-length, optimizing the image's payload capacity.
3. **Optimized LSB Steganography:** Processes image pixel arrays cleanly using `Pillow (PIL)`.
4. **End-of-Message Marker:** Appends a standard 16-bit trailing delimiter (`0000000000000000`) to signal the exact termination of the hidden data stream during decoding.
5. **Robust Error Handling:** Validates image size capacity, file paths, and structural integrity, gracefully handling wrong password attempts.

---

## Project Structure

```text
.
├── LSB.py                 # The main application script housing core logic
├── test_LSB.py            # Automated testing suite powered by pytest
├── requirements.txt       # List of third-party package dependencies
└── README.md              # Project documentation and specifications
