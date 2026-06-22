import pytest
import os
from PIL import Image

from LSB import (
    prepare_data,
    encode_image,
    decode_image,
    recover_message
)


def create_test_image(filename, size=(300, 300)):
    img = Image.new("RGB", size, color="red")
    img.save(filename)


def test_prepare_data():
    bits = prepare_data("Hello CS50", "password123")

    assert isinstance(bits, str)
    assert bits.endswith("0000000000000000")


def test_encode_image():
    create_test_image("input_test.png")

    bits = prepare_data("Hello CS50", "password123")

    assert encode_image(
        "input_test.png",
        bits,
        "output_test.png"
    ) is True

    assert os.path.exists("output_test.png")

    os.remove("input_test.png")
    os.remove("output_test.png")


def test_decode_image():
    create_test_image("input_test.png")

    bits = prepare_data("Hello CS50", "password123")

    encode_image(
        "input_test.png",
        bits,
        "output_test.png"
    )

    extracted = decode_image("output_test.png")

    assert isinstance(extracted, bytes)

    os.remove("input_test.png")
    os.remove("output_test.png")


def test_recover_message():
    create_test_image("input_test.png")

    bits = prepare_data("Hello CS50", "password123")

    encode_image(
        "input_test.png",
        bits,
        "output_test.png"
    )

    extracted = decode_image("output_test.png")

    assert recover_message(
        extracted,
        "password123"
    ) == "Hello CS50"

    os.remove("input_test.png")
    os.remove("output_test.png")


def test_prepare_data_error():
    with pytest.raises(SystemExit):
        prepare_data("", "password123")


def test_decode_image_error():
    with pytest.raises(SystemExit):
        decode_image("not_found.png")