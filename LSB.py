import zlib
import hashlib
from PIL import Image
import base64
from cryptography.fernet import Fernet
import sys
import re

RED = '\033[91m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
BOLD = '\033[1m'
RESET = '\033[0m'

def main():
    if len(sys.argv) != 3:
        print(f"\n{RED}{BOLD}[❌ Error] Missing arguments!{RESET}")
        print(f"{YELLOW}Usage:{RESET}")
        print(f"  🟢 {BOLD}To Encode:{RESET} python {sys.argv[0]} -encode <image_path>")
        print(f"  🔴 {BOLD}To Decode:{RESET} python {sys.argv[0]} -decode <image_path>\n")
        return
    
    if not re.search(r'^.+\.(png|jpg|jpeg)$', sys.argv[2].lower()):
        return print(f"\n{RED}{BOLD}[❌ Error] Invalid image extension! Use PNG or JPG.{RESET}")
    
    img_path = sys.argv[2]
    
    if sys.argv[1] == '-encode':
        message = input(f"{CYAN}💬 What is the secret message? {RESET}")
        password = input(f"{CYAN}🔑 What is the password? {RESET}")
        out = input(f"{CYAN}🖼️  Image output name: {RESET}")

        if not out.lower().endswith('.png'):
            out += '.png'

        try:
            raw_data = prepare_data(message, password)
            res = encode_image(img_path, raw_data, out)
            if res:
                print(f"\n{GREEN}{BOLD}✨ Success! The photo is ready and your secret is safe! 🚀{RESET}\n")
        except (ValueError, FileNotFoundError) as e:
            print(f"\n{RED}{BOLD}[❌ Error] {e}{RESET}\n")
        
    elif sys.argv[1] == '-decode':
        password = input(f"{CYAN}🔑 What is the password? {RESET}")

        try:
            extracted_bits = decode_image(img_path)
            res = recover_message(extracted_bits, password)
            if res == 'Wrong Password':
                print(f"\n{RED}{BOLD}[❌ Error] Wrong Password! Decryption failed.{RESET}\n")
            else:
                print(f"\n{GREEN}{BOLD}🔓 Decrypted Message successfully:{RESET}")
                print(f"{YELLOW}{BOLD}{res}{RESET}\n")
        except Exception as e:
            print(f"\n{RED}{BOLD}[❌ Error] {e}{RESET}\n")

def prepare_data(data, password):
    if not data or not password:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] Missing data{RESET}')
    password_byte = password.encode('utf-8')
    sha256_hash = hashlib.sha256(password_byte).digest()
    fernet_key = base64.urlsafe_b64encode(sha256_hash)

    f = Fernet(fernet_key)

    en_d = data.encode('utf-8')
    en_d = f.encrypt(en_d)

    compressed = zlib.compress(en_d)

    binary_data = ''
    for b in compressed:
        binary_data += format(b, '08b')
    
    limit = '0000000000000000'
    return binary_data + limit

def encode_image(image, coded_data, output):
    if not image:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] Missing data{RESET}')
    try:
        img = Image.open(image)
    except FileNotFoundError:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] File is not found{RESET}')
    img = img.convert('RGB')
    w, h = img.size
    ava_b = (w*h)*3
    if ava_b < len(coded_data):
        raise ValueError("Image size is not suitable for the message")
    
    old_pixles = list(img.getdata())
    new_pixles = []
    pointer = 0

    for px in old_pixles:
        if pointer < len(coded_data):
            r,g,b = px

            if pointer < len(coded_data):
                bit = int(coded_data[pointer])
                r = (r & 254) | bit
                pointer += 1
            
            if pointer < len(coded_data):
                bit = int(coded_data[pointer])
                g = (g & 254) | bit
                pointer += 1

            if pointer < len(coded_data):
                bit = int(coded_data[pointer])
                b = (b & 254) | bit
                pointer += 1
            new_pixles.append((r, g, b))
        else:
            new_pixles.append(px)
    
    n_img = Image.new("RGB", img.size)
    n_img.putdata(new_pixles)
    n_img.save(output, format="PNG")
    return True


def decode_image(image):
    if not image:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] Missing data{RESET}')
    try:
        img = Image.open(image)
    except FileNotFoundError:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] File is not found{RESET}')
    img = img.convert('RGB')
    pixles = list(img.getdata())

    binary_data = ''
    limit = '0000000000000000'

    for px in pixles:
        r,g,b = px

        for cl in (r, g, b):
            bit = str(cl%2)
            binary_data += bit

            if binary_data.endswith(limit):
                break
    
        if binary_data.endswith(limit):
            break
    
    binary_data = binary_data[:-len(limit)]
    
    byte_l = []
    for i in range(0,len(binary_data),8):
        byte_chunk = binary_data[i:i+8]
        if len(byte_chunk) == 8:
                    byte_l.append(int(byte_chunk, 2))    
    return bytes(byte_l)

def recover_message(raw_bytes, password):
    if not raw_bytes or not password:
        sys.exit(f'\n{RED}{BOLD}[❌ Error] Missing data{RESET}')
    password_byt = password.encode('utf-8')
    sha256_hash = hashlib.sha256(password_byt).digest()
    fernet_k = base64.urlsafe_b64encode(sha256_hash)
    try:
        encypted_bytes = zlib.decompress(raw_bytes)
    except Exception:
        return 'Wrong Password'

    fe = Fernet(fernet_k)
    decypt_by = fe.decrypt(encypted_bytes)

    og_message = decypt_by.decode('utf-8')
    return og_message


if __name__ == "__main__":
    main()