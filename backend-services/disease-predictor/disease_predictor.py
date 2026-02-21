import numpy as np
import tensorflow as tf
from tensorflow import keras
import warnings
warnings.filterwarnings('ignore')

class DiseasePredictor:
    def __init__(self, model_path=None):
        """Initialize the disease predictor with TensorFlow Lite model"""
        self.model = None
        if model_path:
            self.load_model(model_path)
        else:
            self.build_simple_model()

    def build_simple_model(self):
        """Build a simple neural network model for predicting disease risk"""
        self.model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(4,)),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        print("Disease prediction model built")

    def load_model(self, model_path):
        """Load pre-trained model"""
        self.model = keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")

    def predict_risk(self, ph, tds, chlorine, temperature):
        """
        Predict disease risk based on water quality parameters
        
        Args:
            ph: Water pH level (6.5-8.5 optimal)
            tds: Total Dissolved Solids (0-500 optimal)
            chlorine: Chlorine level (0.5-2 mg/L optimal)
            temperature: Water temperature in Celsius
            
        Returns:
            risk_score: Float between 0 and 100 representing risk percentage
        """
        # Normalize inputs
        normalized_inputs = np.array([[ph, tds, chlorine, temperature]])
        
        # Normalize to 0-1 range based on optimal ranges
        normalized_inputs[0, 0] = min(max((normalized_inputs[0, 0] - 6.5) / 2, 0), 1)  # pH
        normalized_inputs[0, 1] = min(max(normalized_inputs[0, 1] / 500, 0), 1)  # TDS
        normalized_inputs[0, 2] = min(max((normalized_inputs[0, 2] - 0.5) / 1.5, 0), 1)  # Chlorine
        normalized_inputs[0, 3] = min(max((normalized_inputs[0, 3] - 20) / 15, 0), 1)  # Temperature
        
        # Make prediction
        prediction = self.model.predict(normalized_inputs, verbose=0)
        risk_score = float(prediction[0][0]) * 100
        
        return round(risk_score, 2)

    def predict_batch(self, data_list):
        """
        Predict risk for multiple samples
        
        Args:
            data_list: List of tuples (ph, tds, chlorine, temperature)
            
        Returns:
            List of risk scores
        """
        results = []
        for ph, tds, chlorine, temperature in data_list:
            risk = self.predict_risk(ph, tds, chlorine, temperature)
            results.append(risk)
        return results

    def get_risk_level(self, risk_score):
        """Categorize risk level based on score"""
        if risk_score < 25:
            return 'Low'
        elif risk_score < 50:
            return 'Medium'
        elif risk_score < 75:
            return 'High'
        else:
            return 'Critical'

    def get_recommendations(self, ph, tds, chlorine, temperature):
        """Get water quality improvement recommendations"""
        recommendations = []
        
        if ph < 6.5:
            recommendations.append("Increase pH: Add alkali to water")
        elif ph > 8.5:
            recommendations.append("Decrease pH: Add acid to water")
        
        if tds > 500:
            recommendations.append("High TDS: Consider water treatment/RO filter")
        
        if chlorine < 0.5:
            recommendations.append("Low chlorine: Increase chlorination for disinfection")
        elif chlorine > 2:
            recommendations.append("High chlorine: Reduce chlorine concentration")
        
        if temperature > 30:
            recommendations.append("High temperature: Look for contamination sources")
        
        if not recommendations:
            recommendations.append("Water quality is within acceptable ranges")
        
        return recommendations

    def export_to_tflite(self, output_path='disease_predictor.tflite'):
        """Convert model to TensorFlow Lite format"""
        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        tflite_model = converter.convert()
        
        with open(output_path, 'wb') as f:
            f.write(tflite_model)
        
        print(f"Model exported to {output_path}")


class BlockagePredictor:
    def __init__(self):
        """Initialize blockage predictor"""
        self.model = self.build_model()

    def build_model(self):
        """Build model for pipe blockage prediction"""
        model = keras.Sequential([
            keras.layers.Dense(32, activation='relu', input_shape=(3,)),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy')
        return model

    def predict_blockage(self, tds, chlorine, pressure_drop):
        """
        Predict blockage risk
        
        Args:
            tds: Total Dissolved Solids
            chlorine: Chlorine level
            pressure_drop: Pressure drop in pipes
            
        Returns:
            blockage_risk: Float between 0 and 100
        """
        inputs = np.array([[tds / 500, chlorine / 2, min(pressure_drop / 100, 1)]])
        prediction = self.model.predict(inputs, verbose=0)
        return float(prediction[0][0]) * 100
