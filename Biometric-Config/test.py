from pyzkfp import ZKFP2

zkfp2 = ZKFP2()

try:
    zkfp2.Init()
    print("SDK initialized successfully")

    device_count = zkfp2.GetDeviceCount()
    print(f"{device_count} device(s) found")

    if device_count == 0:
        print("No fingerprint device found. Check connection and drivers.")
        raise SystemExit(1)

    zkfp2.OpenDevice(0)
    print("Fingerprint device opened successfully!")

except Exception as error:
    print(f"Biometric error: {type(error).__name__}: {error}")
    raise SystemExit(1)

finally:
    zkfp2.Terminate()