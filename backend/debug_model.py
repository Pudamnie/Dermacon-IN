import tensorflow as tf
import os

model_path = 'app/ml/model.h5'
print(f"TensorFlow version: {tf.__version__}")
print(f"Keras version: {tf.keras.__version__}")

try:
    model = tf.keras.models.load_model(model_path, compile=False)
    print("✅ Model loaded successfully!")
    model.summary()
except Exception as e:
    print(f"❌ Error loading model: {e}")
    import traceback
    traceback.print_exc()
