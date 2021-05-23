from cryptography.fernet import Fernet
import sys

def symDecrypt(key, str):
	f = Fernet(key)
	msg = f.decrypt(str)
	print(msg.decode())

try:
    symDecrypt(sys.argv[1].encode('utf-8'), sys.argv[2].encode('utf-8'))
    sys.stdout.flush()
except Exception as e:
    sys.stdout.flush()