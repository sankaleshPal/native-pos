import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useModalStore } from '../store/modalStore';
import { prepareKOTPrintData } from '../db/services/kotService';
import { preparePrintData } from '../utils/printUtils';

const KOTOptionsModal: React.FC = () => {
  const { kotOptionsVisible, selectedKOTId, hideKOTOptions, showDeleteItem } =
    useModalStore();

  const handleReprint = async () => {
    if (!selectedKOTId) return;

    try {
      const printData = await prepareKOTPrintData(selectedKOTId);
      if (printData) {
        const formattedData = preparePrintData(printData);
        console.log('Print Data:', formattedData);
        // TODO: Implement actual print functionality
        Alert.alert('Print data prepared! Check console.');
      }
    } catch (error) {
      console.error('Error preparing print data:', error);
      Alert.alert('Failed to prepare print data');
    }

    hideKOTOptions();
  };

  const handleDeleteItem = () => {
    hideKOTOptions();
    showDeleteItem();
  };

  return (
    <Modal
      visible={kotOptionsVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideKOTOptions}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={hideKOTOptions}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>KOT Options</Text>

          <TouchableOpacity style={styles.option} onPress={handleReprint}>
            <Ionicons name="print-outline" size={24} color="#7C3AED" />
            <Text style={styles.optionText}>Reprint KOT</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.deleteOption]}
            onPress={handleDeleteItem}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.optionText, styles.deleteText]}>
              Delete Item
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={hideKOTOptions}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Ubuntu-Bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteOption: {
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  deleteText: {
    color: '#EF4444',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default KOTOptionsModal;
