import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getActiveSessionId } from '../db/services/sessionService';
import { getDatabase } from '../db/database';
import { KOT, Bill, TableSession } from '../db/types';

interface TableSessionModalProps {
  visible: boolean;
  onClose: () => void;
  tableId: number;
  tableName: string;
}

interface SessionDetails {
  session: TableSession;
  kots: KOT[];
  bill: Bill | null;
}

const TableSessionModal: React.FC<TableSessionModalProps> = ({
  visible,
  onClose,
  tableId,
  tableName,
}) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    if (visible && tableId) {
      fetchSessionDetails();
    }
  }, [visible, tableId]);

  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const sessionId = await getActiveSessionId(tableId);
      if (!sessionId) {
        setDetails(null);
        setLoading(false);
        return;
      }

      const db = getDatabase();

      // Fetch Session
      const sessionRes = await db.execute(
        'SELECT * FROM table_sessions WHERE id = ?',
        [sessionId],
      );
      const session = sessionRes.rows?.item(0) as unknown as TableSession;

      // Fetch KOTs
      const kotsRes = await db.execute(
        'SELECT * FROM kots WHERE session_id = ? ORDER BY punched_at ASC',
        [sessionId],
      );
      const kots = (kotsRes.rows?._array || []) as unknown as KOT[];

      // Fetch Bill
      const billRes = await db.execute(
        'SELECT * FROM bills WHERE session_id = ?',
        [sessionId],
      );
      const bill = (billRes.rows?._array?.[0] as unknown as Bill) || null;

      setDetails({ session, kots, bill });
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Info - {tableName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4a90e2"
              style={{ marginTop: 20 }}
            />
          ) : !details ? (
            <View style={styles.emptyContainer}>
              <Text>No active session found for this table.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContent}>
              {/* Session Start */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="play-circle" size={24} color="green" />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Session Started</Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(details.session.start_time)}
                  </Text>
                </View>
              </View>

              {/* KOTs */}
              {details.kots.map((kot, index) => (
                <View key={kot.id} style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Ionicons name="restaurant" size={24} color="#ff9800" />
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>KOT #{kot.id}</Text>
                    <Text style={styles.timelineSubtitle}>
                      {kot.items_count} Items • ₹{kot.subtotal}
                    </Text>
                    <Text style={styles.timelineTime}>
                      {formatDate(kot.punched_at)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Bill */}
              {details.bill ? (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Ionicons name="receipt" size={24} color="#4a90e2" />
                    {details.session.status === 'completed' && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Bill Generated</Text>
                    <Text style={styles.timelineSubtitle}>
                      Total: ₹{details.bill.total}
                    </Text>
                    <Text style={styles.timelineTime}>
                      {formatDate(details.bill.created_at)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Session End / Current Status */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons
                    name={
                      details.session.status === 'completed'
                        ? 'checkmark-circle'
                        : 'time'
                    }
                    size={24}
                    color={
                      details.session.status === 'completed' ? 'green' : 'gray'
                    }
                  />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {details.session.status === 'completed'
                      ? 'Session Completed'
                      : 'In Progress'}
                  </Text>
                  {details.session.end_time && (
                    <Text style={styles.timelineTime}>
                      {formatDate(details.session.end_time)}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  scrollContent: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 70,
  },
  timelineIcon: {
    alignItems: 'center',
    width: 40,
    marginRight: 10,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default TableSessionModal;
