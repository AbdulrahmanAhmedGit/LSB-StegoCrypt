import pytest
import os
from PIL import Image
from LSB import prepare_data, encode_image, decode_image, recover_message

def create_test_image(name, size=(300, 300)):
    img = Image.new("RGB", size, color="red")
    img.save(name)

def test_all_functions():
    bits = prepare_data("Hello CS50", "password123")
    assert isinstance(bits, str)
    assert bits.endswith("0000000000000000")

    create_test_image("input_test.png")
    assert encode_image("input_test.png", bits, "output_test.png") == True

    extracted_bytes = decode_image("output_test.png")
    assert isinstance(extracted_bytes, bytes)

    assert recover_message(extracted_bytes, "password123") == "Hello CS50"

    for file in ["input_test.png", "output_test.png"]:
        if os.path.exists(file):
            os.remove(file)

def test_errors():
    with pytest.raises((SystemExit, ValueError)):
        prepare_data("", "password123")

    with pytest.raises((SystemExit, FileNotFoundError)):
        decode_image("not_found.png")