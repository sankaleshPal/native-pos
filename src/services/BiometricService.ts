import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert, Platform } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics();

class BiometricService {
  async isSensorAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      return (
        available &&
        (biometryType === BiometryTypes.TouchID ||
          biometryType === BiometryTypes.FaceID ||
          biometryType === BiometryTypes.Biometrics)
      );
    } catch (error) {
      console.error('Biometric availability check failed', error);
      return false;
    }
  }

  async simplePrompt(
    promptMessage: string = 'Confirm fingerprint',
  ): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({ promptMessage });
      return success;
    } catch (error) {
      console.error('Biometric prompt failed', error);
      return false;
    }
  }
}

export const biometricService = new BiometricService();
