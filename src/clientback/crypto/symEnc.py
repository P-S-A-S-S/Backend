from cryptography.fernet import Fernet
import sys

def symEncrypt(key, str):
	f = Fernet(key)
	msg = f.encrypt(str)
	print(msg.decode())

try:
    symEncrypt(sys.argv[1].encode('utf-8'), sys.argv[2].encode('utf-8'))
    sys.stdout.flush()
except Exception as e:
    sys.stdout.flush()