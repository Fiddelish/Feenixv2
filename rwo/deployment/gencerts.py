import click
import os

from cryptography.x509 import random_serial_number
from OpenSSL import crypto
from pathlib import Path

@click.command()
@click.option("--common-name",
              type=str, required=True, prompt=True,
              help="Certificate CN")
@click.option("--server-ip",
              type=str, required=True, prompt=True,
              help="product server IP")
@click.option("--cert-path",
              type=str, required=False, prompt=False,
              default="./certs", show_default=True,
              help="certificate output path")
def generate_certificate(**kwargs):
    #can look at generated file using openssl:
    #openssl x509 -inform pem -in selfsigned.crt -noout -text
    # create a key pair
    serial_number = random_serial_number()
    valid_seconds = 10*365*24*60*60
    common_name = kwargs.get("common_name")
    server_ip = kwargs.get("server_ip")
    cert_path = Path(kwargs.get("cert_path"))
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 4096)
    # create a self-signed cert
    cert = crypto.X509()
    cert.set_version(2)
    cert.get_subject().O = "Quantotto Hugs"
    cert.get_subject().CN = common_name
    cert.set_serial_number(serial_number)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(valid_seconds)
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    san_list = [
        f"DNS:{common_name}",
        f"IP:127.0.0.1",
        f"IP:{server_ip}"
    ]
    cert_ext = []
    cert_ext.append(crypto.X509Extension(b"subjectAltName", False, ", ".join(san_list).encode()))
    cert.add_extensions(cert_ext)
    cert.sign(k, "sha512")
    os.makedirs(cert_path, exist_ok=True)
    with (cert_path / "fullchain.pem").open("wt") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert).decode("utf-8"))
    with (cert_path / "privkey.pem").open("wt") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k).decode("utf-8"))

if __name__ == '__main__':
    generate_certificate()
