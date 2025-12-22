import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useModalStore } from '../store/modalStore';
import { useKOT, useDeleteKOTItem } from '../hooks/useDatabase';
import { usePOSStore } from '../store/posStore';

const DeleteItemModal: React.FC = () => {
  const deleteItemVisible = useModalStore(state => state.deleteItemVisible);
  const deleteStep = useModalStore(state => state.deleteStep);
  const selectedItemIds = useModalStore(state => state.selectedItemIds);
  const deletePassword = useModalStore(state => state.deletePassword);
  const deleteReason = useModalStore(state => state.deleteReason);
  const selectedKOTId = useModalStore(state => state.selectedKOTId);
  const setDeleteStep = useModalStore(state => state.setDeleteStep);
  const toggleItemSelection = useModalStore(state => state.toggleItemSelection);
  const setDeletePassword = useModalStore(state => state.setDeletePassword);
  const setDeleteReason = useModalStore(state => state.setDeleteReason);
  const resetDeleteModal = useModalStore(state => state.resetDeleteModal);

  const { currentUser } = usePOSStore();

  const { data: kot, isLoading: itemsLoading } = useKOT(selectedKOTId);
  const deleteKOTItemMutation = useDeleteKOTItem();

  const items = kot?.items.filter(item => !item.is_deleted) || [];
  const loading = itemsLoading || deleteKOTItemMutation.isPending;

  // Debug logs
  console.log('DeleteItemModal render:', {
    visible: deleteItemVisible,
    kotId: selectedKOTId,
    itemsCount: items.length,
    loading,
  });

  const handleNext = () => {
    if (deleteStep === 1) {
      if (selectedItemIds.length === 0) {
        Alert.alert('Error', 'Please select at least one item to delete');
        return;
      }
      setDeleteStep(2);
    } else if (deleteStep === 2) {
      if (!deletePassword.trim()) {
        Alert.alert('Error', 'Please enter your password');
        return;
      }
      setDeleteStep(3);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteReason.trim()) {
      Alert.alert('Error', 'Please enter a reason for deletion');
      return;
    }

    try {
      // Delete each selected item
      for (const itemId of selectedItemIds) {
        await deleteKOTItemMutation.mutateAsync({
          itemId,
          deletedBy: currentUser?.name || 'Unknown',
          reason: deleteReason,
          password: deletePassword,
          tableId: kot?.table_id || 0,
        });
      }

      Alert.alert('Success', 'Items deleted successfully');
      resetDeleteModal();
    } catch (error: any) {
      console.error('Error deleting items:', error);
      Alert.alert('Error', error.message || 'Failed to delete items');
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select items to delete:</Text>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.itemOption,
            selectedItemIds.includes(item.id) && styles.itemSelected,
          ]}
          onPress={() => toggleItemSelection(item.id)}
        >
          <View style={styles.checkbox}>
            {selectedItemIds.includes(item.id) && (
              <Ionicons name="checkmark" size={18} color="#7C3AED" />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text
              style={[
                styles.itemName,
                selectedItemIds.includes(item.id) && {
                  textDecorationLine: 'line-through',
                  color: '#EF4444',
                },
              ]}
            >
              {item.dish_name}
            </Text>
            {item.portion_name && (
              <Text style={styles.itemDetail}>
                Portion: {item.portion_name}
              </Text>
            )}
            <Text style={styles.itemDetail}>
              Qty: {item.quantity} • ₹{item.item_total}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter your password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={deletePassword}
        onChangeText={setDeletePassword}
        autoFocus
      />
      <Text style={styles.hint}>
        Password verification is required to delete items
      </Text>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter reason for deletion:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Reason (e.g., Customer changed mind, Wrong item ordered)"
        multiline
        numberOfLines={4}
        value={deleteReason}
        onChangeText={setDeleteReason}
        autoFocus
      />
      <Text style={styles.hint}>This will be recorded in the system</Text>
    </View>
  );

  return (
    <Modal
      visible={deleteItemVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetDeleteModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Delete Items</Text>
            <TouchableOpacity onPress={resetDeleteModal}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map(step => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  deleteStep >= step && styles.stepDotActive,
                ]}
              />
            ))}
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading...</Text>
            </View>
          ) : (
            <>
              {deleteStep === 1 && renderStep1()}
              {deleteStep === 2 && renderStep2()}
              {deleteStep === 3 && renderStep3()}
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            {deleteStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setDeleteStep((deleteStep - 1) as 1 | 2 | 3)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                deleteStep === 1 && styles.nextButtonFull,
              ]}
              onPress={deleteStep === 3 ? handleConfirmDelete : handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {deleteStep === 3 ? 'Confirm Delete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    backgroundColor: '#7C3AED',
    width: 24,
  },
  stepContent: {
    padding: 20,
    minHeight: 200,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Ubuntu-Bold',
  },
  itemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#7C3AED',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Ubuntu-Bold',
  },
  itemDetail: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default DeleteItemModal;
