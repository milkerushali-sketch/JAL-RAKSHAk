import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import axios from 'axios';

const VillageUserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [diseaseScores, setDiseaseScores] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [newsRes, alertsRes, diseaseRes, complaintsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/user/news', { headers }),
        axios.get('http://localhost:5000/api/user/safety-alerts', { headers }),
        axios.get('http://localhost:5000/api/user/disease-score', { headers }),
        axios.get('http://localhost:5000/api/user/complaints', { headers }),
      ]);

      setNewsUpdates(newsRes.data);
      setSafetyAlerts(alertsRes.data);
      setDiseaseScores(diseaseRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = () => {
    Alert.prompt(
      'File Complaint',
      'Describe your issue',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async (description) => {
            try {
              const token = localStorage.getItem('userToken');
              await axios.post(
                'http://localhost:5000/api/user/complaint',
                { type: 'general', description },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', 'Complaint submitted');
              fetchAllData();
            } catch (error) {
              Alert.alert('Error', 'Failed to submit complaint');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌾 JAL RAKSHAK 🌾</Text>
          <Text style={styles.headerSubtitle}>{user?.villageId}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            News
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'complaints' && styles.activeTab]}
          onPress={() => setActiveTab('complaints')}
        >
          <Text style={[styles.tabText, activeTab === 'complaints' && styles.activeTabText]}>
            Complaints
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Water Quality Status</Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>
                📊 Stay informed about water quality updates
              </Text>
            </View>

            <Text style={styles.sectionTitle} style={{ marginTop: 20 }}>
              Disease Risk Scores
            </Text>
            {Object.entries(diseaseScores).map(([village, score]) => (
              <View key={village} style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>{village}</Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreProgress,
                      {
                        width: `${score}%`,
                        backgroundColor: score > 70 ? '#ff4444' : score > 40 ? '#ffaa00' : '#44aa44',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.scoreValue}>{score}%</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'news' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Government Updates</Text>
            <FlatList
              data={newsUpdates}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.newsCard}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsContent}>{item.content}</Text>
                  <Text style={styles.newsDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Alerts</Text>
            <FlatList
              data={safetyAlerts}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.alertCard, styles[`alert${item.severity}`]]}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.alertMessage}>{item.message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'complaints' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.fileComplaintBtn}
              onPress={handleFileComplaint}
            >
              <Text style={styles.fileComplaintBtnText}>+ File New Complaint</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle} style={{ marginTop: 20 }}>
              Your Complaints
            </Text>
            <FlatList
              data={complaints}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.complaintCard}>
                  <Text style={styles.complaintId}>Complaint #{item.id}</Text>
                  <Text style={styles.complaintType}>Type: {item.type}</Text>
                  <Text style={styles.complaintStatus}>Status: {item.status}</Text>
                  <Text style={styles.complaintDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  scoreCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 12,
    color: '#666',
  },
  newsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  newsContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 10,
    color: '#999',
  },
  alertCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  alertHigh: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f5576c',
  },
  alertMedium: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ffaa00',
  },
  alertLow: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#44aa44',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  alertTime: {
    fontSize: 10,
    color: '#999',
  },
  fileComplaintBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  fileComplaintBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  complaintCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  complaintId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  complaintType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  complaintStatus: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 4,
  },
  complaintDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

export default VillageUserDashboard;
